import { lazy } from "react";

const AuctionDashboard = lazy(() => import("./components/AuctionDashboard"));
const AuctionDetails = lazy(() => import("./components/AuctionDetails"));

export const routes = [
  {
    path: "/",
    element: <AuctionDashboard />,
  },
  {
    path: "/auction/:id",
    element: <AuctionDetails />,
  },
]; 