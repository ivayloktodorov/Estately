import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, cities, properties, propertyImages, favorites, propertyMessages } from '../src/db/schema';
import { requireDatabaseUrl } from './load-env';

const db = drizzle({
  connection: requireDatabaseUrl(),
  schema: { users, cities, properties, propertyImages, favorites, propertyMessages },
});

const sampleUsers = [
  { email: 'softuni_user@estately.com', password: 'pass123', fullName: 'SoftUni User', role: 'user' as const },
  { email: 'softuni_admin@estately.com', password: 'pass123', fullName: 'SoftUni Admin', role: 'admin' as const },
  { email: 'admin@estately.com', password: 'pass123', fullName: 'Admin User', role: 'admin' as const },
  { email: 'john@gmail.com', password: 'pass123', fullName: 'John Doe', role: 'user' as const },
  { email: 'maria@gmail.com', password: 'pass123', fullName: 'Maria Garcia', role: 'user' as const },
  { email: 'david@gmail.com', password: 'pass123', fullName: 'David Smith', role: 'user' as const },
  { email: 'user1@gmail.com', password: 'pass123', fullName: 'User One', role: 'user' as const },
  { email: 'user2@gmail.com', password: 'pass123', fullName: 'User Two', role: 'user' as const },
  { email: 'user3@gmail.com', password: 'pass123', fullName: 'User Three', role: 'user' as const },
  { email: 'user4@gmail.com', password: 'pass123', fullName: 'User Four', role: 'user' as const },
  { email: 'user5@gmail.com', password: 'pass123', fullName: 'User Five', role: 'user' as const },
  { email: 'user6@gmail.com', password: 'pass123', fullName: 'User Six', role: 'user' as const },
  { email: 'user7@gmail.com', password: 'pass123', fullName: 'User Seven', role: 'user' as const },
  { email: 'user8@gmail.com', password: 'pass123', fullName: 'User Eight', role: 'user' as const },
  { email: 'user9@gmail.com', password: 'pass123', fullName: 'User Nine', role: 'user' as const },
  { email: 'user10@gmail.com', password: 'pass123', fullName: 'User Ten', role: 'user' as const },
];

const sampleCities = [
  { name: 'Sofia', slug: 'sofia' },
  { name: 'Varna', slug: 'varna' },
  { name: 'Burgas', slug: 'burgas' },
  { name: 'Plovdiv', slug: 'plovdiv' },
];

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  Sofia: { latitude: 42.6977, longitude: 23.3219 },
  Varna: { latitude: 43.2141, longitude: 27.9147 },
  Burgas: { latitude: 42.5048, longitude: 27.4626 },
  Plovdiv: { latitude: 42.1354, longitude: 24.7453 },
};

const sampleProperties = [
  {
    title: 'Modern Apartment in Sofia Center',
    description: 'Beautiful modern apartment with stunning city views and contemporary design.',
    price: '250000.00',
    city: 'Sofia',
    address: '123 Main Street, Sofia',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 85,
    imageCoverUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
  },
  {
    title: 'Luxury Villa in Varna',
    description: 'Spacious luxury villa near the beach with private garden and pool.',
    price: '450000.00',
    city: 'Varna',
    address: '456 Beach Road, Varna',
    propertyType: 'house',
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 250,
    imageCoverUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    title: 'Studio Apartment in Burgas',
    description: 'Cozy studio apartment perfect for singles or couples.',
    price: '95000.00',
    city: 'Burgas',
    address: '789 Park Street, Burgas',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 35,
    imageCoverUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  },
  {
    title: 'Office Space in Plovdiv',
    description: 'Modern office space in business district with parking.',
    price: '180000.00',
    city: 'Plovdiv',
    address: '321 Business Ave, Plovdiv',
    propertyType: 'office',
    bedrooms: 0,
    bathrooms: 2,
    areaSqm: 120,
    imageCoverUrl: 'https://images.unsplash.com/photo-1497366216548-495531521910?w=400',
  },
  {
    title: 'Two-Bedroom Apartment in Sofia',
    description: 'Comfortable apartment near metro station with modern amenities.',
    price: '180000.00',
    city: 'Sofia',
    address: '654 Metro Street, Sofia',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 75,
    imageCoverUrl: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400',
  },
  {
    title: 'Penthouse in Varna',
    description: 'Luxurious penthouse with panoramic sea views and terrace.',
    price: '550000.00',
    city: 'Varna',
    address: '999 Panorama Heights, Varna',
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 180,
    imageCoverUrl: 'https://images.unsplash.com/photo-1512917774080-9b126fb8f81c?w=400',
  },
  {
    title: 'Historic House in Burgas Old Town',
    description: 'Charming historic house in old town area with character and potential.',
    price: '220000.00',
    city: 'Burgas',
    address: '111 Historic Lane, Burgas',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 140,
    imageCoverUrl: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400',
  },
  {
    title: 'Studio in Plovdiv Center',
    description: 'Affordable studio apartment in city center near shops and restaurants.',
    price: '85000.00',
    city: 'Plovdiv',
    address: '234 Center Square, Plovdiv',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 30,
    imageCoverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
  },
  {
    title: 'Spacious Family Home in Sofia',
    description: 'Perfect family home with large garden and modern kitchen.',
    price: '380000.00',
    city: 'Sofia',
    address: '555 Garden Road, Sofia',
    propertyType: 'house',
    bedrooms: 4,
    bathrooms: 2,
    areaSqm: 220,
    imageCoverUrl: 'https://images.unsplash.com/photo-1572120471610-6ec0d3ca6473?w=400',
  },
  {
    title: 'Modern Office Suite in Varna',
    description: 'Contemporary office suite with meeting rooms and reception area.',
    price: '320000.00',
    city: 'Varna',
    address: '777 Corporate Plaza, Varna',
    propertyType: 'office',
    bedrooms: 0,
    bathrooms: 3,
    areaSqm: 200,
    imageCoverUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
  },
  {
    title: 'Cozy One-Bedroom in Burgas',
    description: 'Warm and welcoming one-bedroom apartment near the sea.',
    price: '125000.00',
    city: 'Burgas',
    address: '888 Seaside Ave, Burgas',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 55,
    imageCoverUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  },
  {
    title: 'Renovated Villa in Plovdiv',
    description: 'Beautifully renovated villa with modern design and traditional elements.',
    price: '320000.00',
    city: 'Plovdiv',
    address: '444 Heritage Street, Plovdiv',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 160,
    imageCoverUrl: 'https://images.unsplash.com/photo-1516455207990-7f88f63ce338?w=400',
  },
  {
    title: 'Premium Apartment Sofia Heights',
    description: 'Premium apartment with premium finishes and smart home technology.',
    price: '320000.00',
    city: 'Sofia',
    address: '111 Heights Road, Sofia',
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 120,
    imageCoverUrl: 'https://images.unsplash.com/photo-1479381671336-cd91216057b7?w=400',
  },
  {
    title: 'Seaside Studio in Varna',
    description: 'Compact studio with sea view and direct beach access.',
    price: '140000.00',
    city: 'Varna',
    address: '222 Beach Front, Varna',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 40,
    imageCoverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
  },
  {
    title: 'Professional Office Space Burgas',
    description: 'Well-equipped office space suitable for various businesses.',
    price: '145000.00',
    city: 'Burgas',
    address: '333 Business Center, Burgas',
    propertyType: 'office',
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 90,
    imageCoverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    title: 'Bright Apartment Plovdiv District',
    description: 'Bright and airy apartment in convenient district with parking.',
    price: '155000.00',
    city: 'Plovdiv',
    address: '555 District Road, Plovdiv',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 68,
    imageCoverUrl: 'https://images.unsplash.com/photo-1542005503-52257501b8ce?w=400',
  },
  {
    title: 'Grand Family Estate Sofia',
    description: 'Grand estate with extensive grounds and luxury amenities.',
    price: '750000.00',
    city: 'Sofia',
    address: '999 Estate Lane, Sofia',
    propertyType: 'house',
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 350,
    imageCoverUrl: 'https://images.unsplash.com/photo-1576941089067-2de3dd663e13?w=400',
  },
  {
    title: 'Contemporary Loft Varna',
    description: 'Trendy contemporary loft with high ceilings and industrial design.',
    price: '280000.00',
    city: 'Varna',
    address: '666 Loft Street, Varna',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 95,
    imageCoverUrl: 'https://images.unsplash.com/photo-1554909811-579a7d1df91d?w=400',
  },
  {
    title: 'Countryside Villa Burgas',
    description: 'Peaceful villa in countryside with garden and natural surroundings.',
    price: '280000.00',
    city: 'Burgas',
    address: '777 Country Road, Burgas',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 145,
    imageCoverUrl: 'https://images.unsplash.com/photo-1589423471066-3aad0b0b7da3?w=400',
  },
  {
    title: 'Boutique Office Plovdiv',
    description: 'Boutique office space with artistic character and natural light.',
    price: '165000.00',
    city: 'Plovdiv',
    address: '888 Art Street, Plovdiv',
    propertyType: 'office',
    bedrooms: 0,
    bathrooms: 2,
    areaSqm: 110,
    imageCoverUrl: 'https://images.unsplash.com/photo-1552592081-6248a3800141?w=400',
  },
];

const sampleMessages = [
  'Hi, I am interested in this property. Can we schedule a viewing?',
  'Is this property still available? What are the next steps?',
  'Hello, I would like more information about this listing.',
  'Can you provide details about the property condition and any renovations?',
  'I am very interested. Please contact me as soon as possible.',
  'What utilities are included in the price?',
  'Is negotiation possible on the asking price?',
  'When is the earliest time for a viewing?',
  'Do you have any similar properties available?',
  'What are the payment terms?',
  'Is financing available?',
  'Can you tell me more about the neighborhood?',
  'Are there any hidden costs or fees?',
  'How long has the property been on the market?',
  'Is there a chance for a long-term rental?',
];

function withoutPassword(user: (typeof sampleUsers)[number] & { passwordHash: string }): typeof users.$inferInsert {
  return {
    email: user.email,
    fullName: user.fullName,
    passwordHash: user.passwordHash,
    role: user.role,
  };
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Insert users
    console.log('📝 Seeding users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        passwordHash: await bcrypt.hash(user.password, 12),
      }))
    );

    const usersToInsert = hashedUsers.map(withoutPassword);
    await db.insert(users).values(usersToInsert).onConflictDoNothing({ target: users.email });
    console.log(`✓ Ensured ${sampleUsers.length} users\n`);

    // Insert cities
    console.log('🏙️  Seeding cities...');
    await db.insert(cities).values(sampleCities);
    console.log(`✓ Created ${sampleCities.length} cities\n`);

    // Insert properties
    console.log('🏠 Seeding properties...');
    const propertiesToInsert = sampleProperties.map((prop, index) => ({
      ...prop,
      listingType: index % 3 === 0 ? 'rent' : 'sale',
      latitude: (cityCoordinates[prop.city].latitude + (index % 4) * 0.006).toFixed(7),
      longitude: (cityCoordinates[prop.city].longitude + (index % 5) * 0.006).toFixed(7),
      createdByUserId: (index % sampleUsers.length) + 1,
      isPublished: true,
      moderationStatus: 'approved',
    }));

    const insertedPropertiesResult = await db
      .insert(properties)
      .values(propertiesToInsert)
      .returning({ id: properties.id });
    console.log(`✓ Created ${propertiesToInsert.length} properties\n`);

    // Insert property images
    console.log('🖼️  Seeding property images...');
    let imageCount = 0;
    for (const prop of insertedPropertiesResult) {
      const propertyImageCount = Math.floor(Math.random() * 3) + 2;
      const images = Array.from({ length: propertyImageCount }, (_, i) => ({
        propertyId: prop.id,
        imageUrl: `https://images.unsplash.com/photo-${1500000000 + prop.id * 1000 + i}?w=400`,
        sortOrder: i,
      }));
      await db.insert(propertyImages).values(images);
      imageCount += images.length;
    }
    console.log(`✓ Created ${imageCount} property images\n`);

    // Insert favorites
    console.log('❤️  Seeding favorites...');
    const favoritesToInsert: (typeof favorites.$inferInsert)[] = [];
    for (let i = 2; i <= 5; i++) {
      const numFavorites = Math.floor(Math.random() * 5) + 2;
      const propertyIds: number[] = [];
      while (propertyIds.length < numFavorites) {
        const randomPropId = Math.floor(Math.random() * insertedPropertiesResult.length) + 1;
        if (!propertyIds.includes(randomPropId)) {
          propertyIds.push(randomPropId);
        }
      }
      propertyIds.forEach((propId) => {
        favoritesToInsert.push({
          userId: i,
          propertyId: propId,
        });
      });
    }

    if (favoritesToInsert.length > 0) {
      await db.insert(favorites).values(favoritesToInsert);
      console.log(`✓ Created ${favoritesToInsert.length} favorites\n`);
    }

    // Insert property messages
    console.log('💬 Seeding property messages...');
    const messagesToInsert: (typeof propertyMessages.$inferInsert)[] = [];
    for (const prop of insertedPropertiesResult.slice(0, 10)) {
      const numMessages = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numMessages; i++) {
        const userId = Math.floor(Math.random() * (sampleUsers.length - 1)) + 2;
        messagesToInsert.push({
          propertyId: prop.id,
          userId,
          message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        });
      }
    }
    await db.insert(propertyMessages).values(messagesToInsert);
    console.log(`✓ Created ${messagesToInsert.length} property messages\n`);

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
