// Shared types and utilities for Trip Plan App

export interface TravelPlan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  travelPlanId: string;
  name: string;
  location?: string;
  date: string;
  notes?: string;
}
