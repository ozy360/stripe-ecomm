import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import { Product } from "@/app/models/Schemas";
// @ts-expect-error: imgur types are not correctly exported
import { ImgurClient } from "imgur";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    let query: any = {};

    if (category) {
      query.category = { $in: [category] };
    }

    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const data = await req.formData();
    const formData: any = {};
    const uploadedImages: Array<{ url: string; deleteHash: string }> = [];

    // Imgur client setup
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      throw new Error("Imgur credentials not configured");
    }

    const client = new ImgurClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    // Collect all image files first
    const imageFiles: File[] = [];
    const regularFields: Map<string, string> = new Map();

    // Process form data
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        imageFiles.push(value);
      } else {
        regularFields.set(key, value as string);
      }
    }

    // Upload all images to Imgur
    for (const file of imageFiles) {
      const imageName = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString("base64");

      try {
        const response = await client.upload({
          image: base64String,
          type: "base64",
        });

        const imageUrl = response.data.link;
        const deleteHash = response.data.deletehash;

        // Add to images array
        uploadedImages.push({
          url: imageUrl,
          deleteHash: deleteHash,
        });
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Continue with other images even if one fails
      }
    }

    // Process regular form fields
    for (const [key, stringValue] of regularFields.entries()) {
      if (key === "price" || key === "stock") {
        formData[key] = parseFloat(stringValue);
      } else if (key === "isActive") {
        formData[key] = stringValue === "true";
      } else if (key === "category") {
        formData[key] = stringValue
          .split(",")
          .map((cat: string) => cat.trim())
          .filter(Boolean);
      } else {
        formData[key] = stringValue;
      }
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      formData.price === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, description, and price are required",
        },
        { status: 400 },
      );
    }

    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const product = new Product({
      name: formData.name,
      slug,
      description: formData.description,
      price: formData.price,
      images: uploadedImages, // Array of image objects
      category: formData.category || [],
      stock: formData.stock || 0,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    });

    const savedProduct = await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: JSON.parse(JSON.stringify(savedProduct)),
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create product" },
      { status: 500 },
    );
  }
}
