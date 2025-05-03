export type Manufacturer = {
  id: string
  name: string
  address: string
  specialties: string[]
  rating: number
  capacity: string
  leadTime: string
  contactInfo: {
    contactPerson: string
    email: string
    phone: string
  }
  activeJobs: number
  completedJobs: number
  joinedDate: string
}

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: "m1",
    name: "Elegant Creations Ltd.",
    address: "123 Jewelry Lane, Craftsville, NY 10001",
    specialties: ["Rings", "Necklaces"],
    rating: 4.8,
    capacity: "High",
    leadTime: "7-10 days",
    contactInfo: {
      contactPerson: "John Smith",
      email: "john@elegantcreations.com",
      phone: "+1 (212) 555-1234",
    },
    activeJobs: 12,
    completedJobs: 145,
    joinedDate: "2018-05-12",
  },
  {
    id: "m2",
    name: "Precision Jewelry Co.",
    address: "456 Diamond Street, Gemtown, CA 90210",
    specialties: ["Earrings", "Bracelets"],
    rating: 4.5,
    capacity: "Medium",
    leadTime: "5-7 days",
    contactInfo: {
      contactPerson: "Sarah Johnson",
      email: "sarah@precisionjewelry.com",
      phone: "+1 (310) 555-6789",
    },
    activeJobs: 8,
    completedJobs: 98,
    joinedDate: "2019-03-24",
  },
  {
    id: "m3",
    name: "Golden Touch Manufacturers",
    address: "789 Gold Avenue, Metalworks, TX 75001",
    specialties: ["Gold Items", "Custom Designs"],
    rating: 4.7,
    capacity: "High",
    leadTime: "10-14 days",
    contactInfo: {
      contactPerson: "Michael Chen",
      email: "michael@goldentouch.com",
      phone: "+1 (214) 555-9012",
    },
    activeJobs: 15,
    completedJobs: 210,
    joinedDate: "2017-11-08",
  },
  {
    id: "m4",
    name: "Diamond Craft Industries",
    address: "101 Precious Stone Road, Sparkle City, IL 60601",
    specialties: ["Diamond Setting", "Luxury Items"],
    rating: 4.9,
    capacity: "Low",
    leadTime: "14-21 days",
    contactInfo: {
      contactPerson: "Emily Rodriguez",
      email: "emily@diamondcraft.com",
      phone: "+1 (312) 555-3456",
    },
    activeJobs: 5,
    completedJobs: 87,
    joinedDate: "2020-01-15",
  },
  {
    id: "m5",
    name: "Silver Lining Artisans",
    address: "202 Silver Street, Craftington, WA 98101",
    specialties: ["Silver Jewelry", "Artisan Pieces"],
    rating: 4.6,
    capacity: "Medium",
    leadTime: "7-10 days",
    contactInfo: {
      contactPerson: "David Wilson",
      email: "david@silverlining.com",
      phone: "+1 (206) 555-7890",
    },
    activeJobs: 10,
    completedJobs: 132,
    joinedDate: "2019-07-30",
  },
  {
    id: "m6",
    name: "Heritage Jewelry Works",
    address: "303 Antique Lane, Heirloom Heights, MA 02108",
    specialties: ["Vintage Styles", "Restoration"],
    rating: 4.4,
    capacity: "Low",
    leadTime: "14-21 days",
    contactInfo: {
      contactPerson: "Olivia Thompson",
      email: "olivia@heritagejewelry.com",
      phone: "+1 (617) 555-2345",
    },
    activeJobs: 3,
    completedJobs: 65,
    joinedDate: "2021-04-18",
  },
  {
    id: "m7",
    name: "Modern Metals Manufacturing",
    address: "404 Contemporary Blvd, Trendville, FL 33101",
    specialties: ["Modern Designs", "Mixed Metals"],
    rating: 4.3,
    capacity: "High",
    leadTime: "5-7 days",
    contactInfo: {
      contactPerson: "James Brown",
      email: "james@modernmetals.com",
      phone: "+1 (305) 555-6789",
    },
    activeJobs: 18,
    completedJobs: 175,
    joinedDate: "2018-09-12",
  },
  {
    id: "m8",
    name: "Gem Valley Productions",
    address: "505 Gemstone Drive, Crystal Springs, CO 80202",
    specialties: ["Gemstone Setting", "Colored Stones"],
    rating: 4.7,
    capacity: "Medium",
    leadTime: "10-14 days",
    contactInfo: {
      contactPerson: "Sophia Martinez",
      email: "sophia@gemvalley.com",
      phone: "+1 (303) 555-0123",
    },
    activeJobs: 9,
    completedJobs: 110,
    joinedDate: "2019-11-05",
  },
  {
    id: "m9",
    name: "Artisan Jewelry Collective",
    address: "606 Craftsman Way, Artisanville, OR 97201",
    specialties: ["Handcrafted Items", "Custom Orders"],
    rating: 4.8,
    capacity: "Low",
    leadTime: "21-28 days",
    contactInfo: {
      contactPerson: "Daniel Lee",
      email: "daniel@artisanjewelry.com",
      phone: "+1 (503) 555-4567",
    },
    activeJobs: 4,
    completedJobs: 72,
    joinedDate: "2020-08-22",
  },
  {
    id: "m10",
    name: "Luxury Metals & Gems",
    address: "707 Luxury Lane, Opulence City, NV 89101",
    specialties: ["High-End Jewelry", "Platinum Work"],
    rating: 5.0,
    capacity: "Medium",
    leadTime: "14-21 days",
    contactInfo: {
      contactPerson: "Alexandra Kim",
      email: "alexandra@luxurymetals.com",
      phone: "+1 (702) 555-8901",
    },
    activeJobs: 7,
    completedJobs: 95,
    joinedDate: "2019-05-17",
  },
]
