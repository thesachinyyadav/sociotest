import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NavigationBar from "./_components/NavigationBar";
import { config, getApiUrl } from "@/lib/config";

import {
  EventsProvider,
  EventForCard,
  CarouselDisplayImage,
} from "../context/EventContext";

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "SOCIO",
};

interface FetchedEvent {
  id: number;
  event_id: string;
  title: string;
  event_date: string | null;
  event_time: string | null;
  venue: string | null;
  category: string | null;
  department_access: string[] | string | null;
  claims_applicable: boolean | null;
  registration_fee: number | null;
  event_image_url: string | null;
  banner_url: string | null;
  created_at: string;
  organizing_dept: string | null;
  fest: string;
  created_by: string;
}

const deriveTags = (event: FetchedEvent): string[] => {
  const tags: string[] = [];
  if (event.category) {
    tags.push(event.category);
  }
  if (event.claims_applicable) {
    tags.push("Claims");
  }
  if (event.registration_fee === 0 || event.registration_fee === null) {
    tags.push("Free");
  } else if (event.registration_fee > 0) {
    tags.push("Paid");
  }
  return tags.filter((tag) => tag && tag.trim() !== "");
};

const getRandomEvents = (
  events: FetchedEvent[],
  count: number
): FetchedEvent[] => {
  if (!events || events.length === 0) return [];
  const shuffled = [...events].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, events.length));
};

const transformToEventCardData = (event: FetchedEvent): EventForCard => {
  return {
    id: event.id,
    event_id: event.event_id || String(event.id),
    title: event.title,
    fest: event.fest,
    date: event.event_date,
    time: event.event_time,
    location: event.venue || "Location TBD",
    tags: deriveTags(event),
    image:
      event.event_image_url ||
      "https://via.placeholder.com/400x250.png?text=Event+Image",
    organizing_dept: event.organizing_dept || "TBD",
  };
};

const transformToCarouselImage = (
  event: FetchedEvent
): CarouselDisplayImage => {
  return {
    id: event.id,
    src:
      event.banner_url ||
      event.event_image_url ||
      "https://via.placeholder.com/1200x400.png?text=Event+Banner",
    link: `/event/${event.event_id}`,
    title: event.title,
    department: event.organizing_dept || "",
  };
};

async function getInitialEventsData() {
  let allEvents: FetchedEvent[] = [];
  let carouselEvents: CarouselDisplayImage[] = [];
  let trendingEvents: EventForCard[] = [];
  let upcomingEvents: EventForCard[] = [];
  let isLoading = true;
  let error: string | null = null;

  try {
    const response = await fetch(getApiUrl("/api/events"), {
      cache: "no-cache", // Changed from force-cache to no-cache for debugging
    });

    if (!response.ok) {
      let errorMsg = `Network response was not ok: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (jsonError) {}
      
      // Log the error but don't throw - provide fallback data instead
      console.error("API Error:", errorMsg);
      
      // Return empty data instead of throwing
      return {
        allEvents: [],
        carouselEvents: [],
        trendingEvents: [],
        upcomingEvents: [],
        isLoading: false,
        error: `Backend API Error: ${errorMsg}`,
      };
    }

    const data = await response.json();

    if (data.events && Array.isArray(data.events)) {
      allEvents = data.events as FetchedEvent[];

      if (allEvents.length > 0) {
        const randomEventsForCarousel = getRandomEvents(allEvents, 3);
        carouselEvents = randomEventsForCarousel.map(transformToCarouselImage);

        const sortedEvents = [...allEvents].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestEventsForSections = sortedEvents.slice(0, 3);

        trendingEvents = latestEventsForSections.map((event) => {
          const baseCardData = transformToEventCardData(event);
          const uniqueTags = Array.from(
            new Set(["Trending", ...baseCardData.tags])
          );
          return { ...baseCardData, tags: uniqueTags };
        });

        upcomingEvents = latestEventsForSections.map(transformToEventCardData);
      } else {
        console.log("No events found from API.");
      }
    } else {
      throw new Error("Fetched event data is not in the expected format.");
    }
  } catch (err: any) {
    console.error("Error fetching initial events in RootLayout:", err);
    error =
      err.message || "Failed to load initial events. Please try again later.";
    allEvents = [];
    carouselEvents = [];
    trendingEvents = [];
    upcomingEvents = [];
  } finally {
    isLoading = false;
  }

  return {
    allEvents,
    carouselEvents,
    trendingEvents,
    upcomingEvents,
    isLoading,
    error,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    allEvents,
    carouselEvents,
    trendingEvents,
    upcomingEvents,
    isLoading,
    error,
  } = await getInitialEventsData();

  return (
    <html lang="en">
      <body
        className={`font-sans antialiased bg-[#FFFFFF] text-[#101010]`}
      >
        <AuthProvider>
          <EventsProvider
            initialAllEvents={allEvents as any}
            initialCarouselEvents={carouselEvents as any}
            initialTrendingEvents={trendingEvents as any}
            initialUpcomingEvents={upcomingEvents as any}
            initialIsLoading={isLoading}
            initialError={error}
          >
            <NavigationBar />
            {children}
          </EventsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
