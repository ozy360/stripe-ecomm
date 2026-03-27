import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import { Product } from "@/app/models/Schemas";
// @ts-expect-error: imgur types are not correctly exported
import { ImgurClient } from "imgur";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    await connectDB();

    // Unwrap the params promise first
    const unwrappedParams = await params;
    const productId = unwrappedParams.id;

    const data = await req.formData();
    const updateData: any = {};
    const newImages: Array<{ url: string; deleteHash: string }> = [];

    // Imgur client setup
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      throw new Error("Imgur credentials not configured");
    }

    const client = new ImgurClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    // Get existing product to preserve existing images
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Start with existing images
    let updatedImages = [...(existingProduct.images || [])];

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

    // Upload new images if any
    if (imageFiles.length > 0) {
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

          // Add to new images array
          newImages.push({
            url: imageUrl,
            deleteHash: deleteHash,
          });
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with other images even if one fails
        }
      }

      if (newImages.length > 0) {
        updatedImages = newImages;
      }
    }

    // Process regular form fields
    for (const [key, stringValue] of regularFields.entries()) {
      if (key === "name") {
        updateData.name = stringValue;
      } else if (key === "description") {
        updateData.description = stringValue;
      } else if (key === "price") {
        updateData.price = parseFloat(stringValue);
      } else if (key === "stock") {
        updateData.stock = parseInt(stringValue);
      } else if (key === "isActive") {
        updateData.isActive = stringValue === "true";
      } else if (key === "category") {
        updateData.category = stringValue
          .split(",")
          .map((cat: string) => cat.trim())
          .filter(Boolean);
      }
    }

    // Update images array
    updateData.images = updatedImages;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true },
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("PUT Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update product" },
      { status: 500 },
    );
  }
}
