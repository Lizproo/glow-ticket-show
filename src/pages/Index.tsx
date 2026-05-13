import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Chatbot from "@/components/Chatbot";
import HomeScreen from "@/screens/HomeScreen";
import SearchScreen from "@/screens/SearchScreen";
import FavoritesScreen from "@/screens/FavoritesScreen";
import MyTicketsScreen from "@/screens/MyTicketsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import EventDetailScreen from "@/screens/EventDetailScreen";
import SeatSelectionScreen from "@/screens/SeatSelectionScreen";
import CheckoutScreen from "@/screens/CheckoutScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import { Event } from "@/lib/data";
import { isOnboarded } from "@/hooks/usePreferences";

type Screen =
  | { type: "tabs" }
  | { type: "event-detail"; event: Event }
  | { type: "seat-selection"; event: Event }
  | { type: "checkout"; event: Event; section: string; quantity: number; total: number };

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [screen, setScreen] = useState<Screen>({ type: "tabs" });
  const [onboarded, setOnboardedState] = useState<boolean>(true);

  useEffect(() => {
    setOnboardedState(isOnboarded());
  }, []);

  const handleEventSelect = (event: Event) => setScreen({ type: "event-detail", event });
  const handleSelectSeats = (event: Event) => setScreen({ type: "seat-selection", event });
  const handleCheckout = (event: Event, section: string, quantity: number, total: number) =>
    setScreen({ type: "checkout", event, section, quantity, total });
  const handleCheckoutComplete = () => {
    setScreen({ type: "tabs" });
    setActiveTab("tickets");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onEventSelect={handleEventSelect} />;
      case "search":
        return <SearchScreen onEventSelect={handleEventSelect} />;
      case "favorites":
        return <FavoritesScreen onEventSelect={handleEventSelect} />;
      case "tickets":
        return <MyTicketsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onEventSelect={handleEventSelect} />;
    }
  };

  const renderScreen = () => {
    switch (screen.type) {
      case "event-detail":
        return (
          <EventDetailScreen
            event={screen.event}
            onBack={() => setScreen({ type: "tabs" })}
            onSelectSeats={handleSelectSeats}
          />
        );
      case "seat-selection":
        return (
          <SeatSelectionScreen
            event={screen.event}
            onBack={() => setScreen({ type: "event-detail", event: screen.event })}
            onCheckout={handleCheckout}
          />
        );
      case "checkout":
        return (
          <CheckoutScreen
            event={screen.event}
            section={screen.section}
            quantity={screen.quantity}
            total={screen.total}
            onBack={() => setScreen({ type: "seat-selection", event: screen.event })}
            onComplete={handleCheckoutComplete}
          />
        );
      default:
        return renderTabContent();
    }
  };

  if (!onboarded) {
    return (
      <main className="min-h-screen bg-background max-w-md mx-auto relative overflow-x-hidden">
        <OnboardingScreen onComplete={() => setOnboardedState(true)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background max-w-md mx-auto relative overflow-x-hidden">
      <div key={screen.type === "tabs" ? activeTab : screen.type} className="animate-fade-in">
        {renderScreen()}
      </div>
      <Chatbot />
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setScreen({ type: "tabs" });
        }}
      />
    </main>
  );
};

export default Index;
