import Nav from '@/components/nav';
import Footer from '@/components/footer';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex flex-1 flex-col">
        <div className="container mx-auto px-6 py-16 md:px-12 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100 md:aspect-square">
              <img
                src="/firsthalf.jpeg"
                alt="About LuxeComm"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Redefining Luxury E-Commerce
              </h1>
              <div className="text-muted-foreground space-y-4 md:text-lg">
                <p>
                  At LuxeComm, we believe that luxury is not just about the
                  price tag, but about the experience, the quality, and the
                  story behind every product. Founded in 2024, we set out to
                  create a digital sanctuary for those who appreciate the finer
                  things in life.
                </p>
                <p>
                  Our curated collection features exclusive items from
                  world-renowned designers and emerging artisans alike. We are
                  committed to sustainability, authenticity, and unparalleled
                  customer service.
                </p>
                <p>
                  Whether you are looking for the perfect statement piece for
                  your wardrobe or a timeless gift for a loved one, LuxeComm is
                  your destination for excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
