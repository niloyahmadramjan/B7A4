
export interface RegisterUserPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
    avatar: string;

}

/**

model User {
  id            String      @id @default(cuid())

  name          String
  email         String      @unique
  phone         String?     @unique
  password      String

  role          UserRole
  status        UserStatus  @default(ACTIVE)

  avatar        String?

  isVerified    Boolean     @default(false)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  technicianProfile TechnicianProfile?

  customerBookings Booking[] @relation("CustomerBookings")
  technicianBookings Booking[] @relation("TechnicianBookings")

  reviewsGiven Review[] @relation("CustomerReviews")

  payments Payment[]

  @@map("users")
}

 * 
*/