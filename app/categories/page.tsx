import { getCategories } from "@/components/actions";
import CategoriesClient from "./categoriesclient";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export default async function Categories() {
  const categories = await getCategories();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <CategoriesClient categories={categories} />
      <Footer />
    </div>
  );
}
