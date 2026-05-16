/**
 * Shared Location/Theatre Seed Data
 *
 * Purpose:
 * Holds reusable seed data for locations, theatres, theatre card content, and
 * slot templates. It is imported by the main seed and the targeted Noida seed.
 *
 * When to edit:
 * Update this when a location/theatre setup must be deployed to another
 * environment through seed scripts. For live admin-managed data, be careful:
 * anything included here can overwrite matching records when the seed runner
 * is configured to run that location.
 *
 * Note:
 * This file is not a runnable seed step. Keep it unnumbered because it is
 * shared config, not a script to execute directly.
 */

import type { Prisma } from "@prisma/client";

export type SlotTemplateSeedConfig = {
  startTime: string;
  endTime: string;
  regularPrice: number;
  salePrice?: number | null;
  decorationMandatory?: boolean;
  bufferMin?: number;
};

export type TheatreSeedConfig = {
  name: string;
  sortOrder: number;
  images: string[];
  capacity: number;
  baseGuests: number;
  hasFood: boolean;
  decorationPrice: number;
  extraPersonPrice: number;
  menuFile: string;
  mapUrl: string;
  footerMessage?: string | null;
  cardContent?: Prisma.InputJsonValue | null;
  slotTemplates: SlotTemplateSeedConfig[];
};

export type LocationSeedConfig = {
  name: string;
  city: string;
  sortOrder: number;
  theatres: TheatreSeedConfig[];
};

const DEFAULT_IMAGES = [
  "/media/booking/villa-details/hero-1.jpg",
  "/media/booking/villa-details/hero-1.jpg",
  "/media/booking/villa-details/hero-1.jpg",
];

const DEFAULT_MENU_FILE = "";
const DEFAULT_MAP_URL = "https://maps.app.goo.gl/JS3stLbATdCEjDG96";

const NOIDA_COUPLE_CARD_CONTENT = {
  capacity: { enabled: true, text: "Up to {{capacity}} People" },
  food: { enabled: true, text: "Food" },
  decor: { enabled: true, text: "Decor ₹{{decorationPrice}} Only" },
  freeCancellation: { enabled: true, text: "Free Cancellation*" },
  idealFor: {
    enabled: true,
    title: "Ideal for",
    linePrimary: "couple",
    lineSecondary: "",
  },
  nextStep: {
    enabled: true,
    title: "Next Step:",
    addDetails: { enabled: true, text: "Add Details" },
    addCake: { enabled: true, text: "Add Cake" },
    fogEntry: { enabled: true, text: "Fog Entry" },
    gifts: { enabled: true, text: "Gifts" },
  },
};

const NOIDA_FAMILY_CARD_CONTENT = {
  ...NOIDA_COUPLE_CARD_CONTENT,
  idealFor: {
    enabled: true,
    title: "Ideal for",
    linePrimary: "couple and",
    lineSecondary: "family",
  },
};

export const LOCATION_SEED_CONFIGS: LocationSeedConfig[] = [
  {
    name: "Pitampura",
    city: "Delhi",
    sortOrder: 1,
    theatres: [
      {
        name: "Theatre 1",
        sortOrder: 1,
        images: DEFAULT_IMAGES,
        capacity: 2,
        baseGuests: 2,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 300,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        slotTemplates: [
          { startTime: "09:00", endTime: "12:00", regularPrice: 1399, decorationMandatory: true },
          { startTime: "12:30", endTime: "15:30", regularPrice: 1399, decorationMandatory: true },
          { startTime: "16:00", endTime: "17:30", regularPrice: 649, decorationMandatory: true },
          { startTime: "18:00", endTime: "21:00", regularPrice: 1399, decorationMandatory: true },
          { startTime: "21:30", endTime: "00:30", regularPrice: 1399, decorationMandatory: true },
        ],
      },
      {
        name: "Theatre 2",
        sortOrder: 2,
        images: [
          "/media/booking/villa-details/hero-1.jpg",
          "/media/booking/villa-details/hero-1.jpg",
          "/media/booking/villa-details/hero-1.jpg",
        ],
        capacity: 6,
        baseGuests: 4,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 300,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        slotTemplates: [
          { startTime: "09:30", endTime: "12:30", regularPrice: 1599 },
          { startTime: "13:00", endTime: "16:00", regularPrice: 1599 },
          { startTime: "16:30", endTime: "18:00", regularPrice: 849, decorationMandatory: true },
          { startTime: "18:30", endTime: "21:30", regularPrice: 1599 },
          { startTime: "22:00", endTime: "01:00", regularPrice: 1599 },
        ],
      },
      {
        name: "Theatre 3",
        sortOrder: 3,
        images: [
          "/media/booking/villa-details/hero-1.jpg",
          "/media/booking/villa-details/hero-1.jpg",
          "/media/booking/villa-details/hero-1.jpg",
        ],
        capacity: 10,
        baseGuests: 4,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 300,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        slotTemplates: [
          { startTime: "10:00", endTime: "13:00", regularPrice: 1799, decorationMandatory: true },
          { startTime: "13:30", endTime: "16:30", regularPrice: 1799, decorationMandatory: true },
          { startTime: "17:00", endTime: "20:00", regularPrice: 1799, decorationMandatory: true },
          { startTime: "20:30", endTime: "23:30", regularPrice: 1799, decorationMandatory: true },
        ],
      },
    ],
  },
  {
    name: "Noida Sector 144",
    city: "Noida",
    sortOrder: 2,
    theatres: [
      {
        name: "Theatre 1",
        sortOrder: 4,
        images: ["/media/booking/villa-details/hero-1.jpg"],
        capacity: 2,
        baseGuests: 2,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 0,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        footerMessage: "",
        cardContent: NOIDA_COUPLE_CARD_CONTENT,
        slotTemplates: [
          { startTime: "09:00", endTime: "12:00", regularPrice: 1850 },
          { startTime: "12:30", endTime: "15:30", regularPrice: 1850 },
          { startTime: "16:00", endTime: "17:30", regularPrice: 1100 },
          { startTime: "18:00", endTime: "21:00", regularPrice: 1850 },
          { startTime: "21:30", endTime: "00:30", regularPrice: 1850 },
        ],
      },
      {
        name: "Theatre 2",
        sortOrder: 5,
        images: ["/media/booking/villa-details/hero-1.jpg"],
        capacity: 14,
        baseGuests: 4,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 400,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        footerMessage: "",
        cardContent: NOIDA_FAMILY_CARD_CONTENT,
        slotTemplates: [
          { startTime: "10:00", endTime: "14:00", regularPrice: 2150 },
          { startTime: "14:30", endTime: "18:30", regularPrice: 2150 },
          { startTime: "19:00", endTime: "23:00", regularPrice: 2150 },
        ],
      },
      {
        name: "Theatre 3",
        sortOrder: 6,
        images: ["/media/booking/villa-details/hero-1.jpg"],
        capacity: 12,
        baseGuests: 4,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 400,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        footerMessage: "",
        cardContent: NOIDA_FAMILY_CARD_CONTENT,
        slotTemplates: [
          { startTime: "10:30", endTime: "13:30", regularPrice: 1950 },
          { startTime: "14:00", endTime: "17:00", regularPrice: 1950 },
          { startTime: "17:30", endTime: "20:30", regularPrice: 1950 },
          { startTime: "21:00", endTime: "00:00", regularPrice: 1950 },
        ],
      },
      {
        name: "Theatre 4",
        sortOrder: 7,
        images: ["/media/booking/villa-details/hero-1.jpg"],
        capacity: 4,
        baseGuests: 4,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 400,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        footerMessage: "",
        cardContent: NOIDA_FAMILY_CARD_CONTENT,
        slotTemplates: [
          { startTime: "09:30", endTime: "12:30", regularPrice: 1900 },
          { startTime: "13:00", endTime: "16:00", regularPrice: 1900 },
          { startTime: "16:30", endTime: "18:00", regularPrice: 1150 },
          { startTime: "18:30", endTime: "21:30", regularPrice: 1900 },
          { startTime: "22:00", endTime: "01:00", regularPrice: 1900 },
        ],
      },
      {
        name: "Theatre 5",
        sortOrder: 8,
        images: ["/media/booking/villa-details/hero-1.jpg"],
        capacity: 20,
        baseGuests: 4,
        hasFood: true,
        decorationPrice: 750,
        extraPersonPrice: 400,
        menuFile: DEFAULT_MENU_FILE,
        mapUrl: DEFAULT_MAP_URL,
        footerMessage: "",
        cardContent: NOIDA_FAMILY_CARD_CONTENT,
        slotTemplates: [
          { startTime: "11:00", endTime: "14:00", regularPrice: 2000 },
          { startTime: "14:30", endTime: "17:30", regularPrice: 2000 },
          { startTime: "18:00", endTime: "21:00", regularPrice: 2000 },
          { startTime: "21:30", endTime: "00:30", regularPrice: 2000 },
        ],
      },
    ],
  },
];
