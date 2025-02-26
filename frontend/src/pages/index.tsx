import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Head>
        <title>Fan Event Prediction App</title>
        <meta
          name="description"
          content="Plan ahead for your favorite artist's events"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen p-8">
        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Fan Event Prediction App
          </h1>
          <p className="text-xl text-center mb-12">
            Plan for events and predict expenses for your favorite artists
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Event Prediction</h2>
              <p className="mb-4">
                Predict upcoming events based on past patterns and social media
                activity
              </p>
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-opacity-90 transition"
                onClick={() => setIsLoading(!isLoading)}
              >
                {isLoading ? "Loading..." : "Get Started"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Budget Planning</h2>
              <p className="mb-4">
                Calculate and save for expenses related to upcoming events
              </p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-opacity-90 transition">
                Plan Budget
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Artist Tracking</h2>
              <p className="mb-4">
                Follow your favorite artists and get personalized predictions
              </p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-opacity-90 transition">
                Track Artists
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
