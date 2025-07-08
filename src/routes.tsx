import { lazy } from "react";

const AuctionDashboard = lazy(() => import("./components/AuctionDashboard"));
const AuctionDetails = lazy(() => import("./components/AuctionDetails"));
// Add more lazy imports as your app grows

export const routes = [
  {
    path: "/",
    element: <AuctionDashboard />,
  },
  {
    path: "/auction/:id",
    element: <AuctionDetails />,
  },
  // Add more routes here
]; 