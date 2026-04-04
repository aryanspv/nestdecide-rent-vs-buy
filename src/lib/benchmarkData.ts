// "People Like You" persona × city benchmarks
// Curated from housing surveys, property portals, and Reddit anecdotes

export interface Benchmark {
  profile: string;
  city: string;
  incomeRange: [number, number]; // monthly income range
  insight: string;
  source?: string;
}

export const BENCHMARKS: Benchmark[] = [
  // Bachelors
  { profile: 'bachelor', city: 'bengaluru', incomeRange: [80000, 200000], insight: 'Most bachelors in Bengaluru earning ₹80K-₹2L rent in Koramangala/Indiranagar for 3-5 years before buying on the outskirts.' },
  { profile: 'bachelor', city: 'bengaluru', incomeRange: [200000, 9999999], insight: 'High-earning bachelors in Bengaluru increasingly buy 1BHKs in Whitefield/Sarjapur as investment — they rent where they live and own elsewhere.' },
  { profile: 'bachelor', city: 'mumbai', incomeRange: [80000, 200000], insight: 'Bachelors in Mumbai rarely buy before 30. Most rent shared apartments in Andheri/Powai and invest the difference in mutual funds.' },
  { profile: 'bachelor', city: 'delhi', incomeRange: [50000, 150000], insight: 'Bachelors in Delhi NCR face severe rental discrimination. Many end up in PG accommodations even at ₹1L+ salaries. Buying a studio flat is surprisingly common.' },
  { profile: 'bachelor', city: 'pune', incomeRange: [60000, 150000], insight: 'Pune bachelors love the Kothrud-Baner corridor for renting. Most wait 5-7 years before buying in Hinjewadi/Wakad where prices are lower.' },
  { profile: 'bachelor', city: 'hyderabad', incomeRange: [70000, 180000], insight: 'Bachelors in Hyderabad rent in Gachibowli/Madhapur and buy early — property prices are still affordable compared to Bengaluru/Mumbai.' },
  { profile: 'bachelor', city: 'gurgaon', incomeRange: [100000, 300000], insight: 'Gurgaon bachelors enjoy the most liberal rental market. Most rent furnished apartments on Golf Course Road and delay buying by 5+ years.' },

  // Couples
  { profile: 'couple', city: 'bengaluru', incomeRange: [150000, 400000], insight: 'Dual-income couples in Bengaluru typically buy a 2BHK within 3-4 years of marriage. HSR Layout and Electronic City are popular first-buy areas.' },
  { profile: 'couple', city: 'mumbai', incomeRange: [200000, 500000], insight: 'Mumbai couples often rent for 5-8 years in the suburbs before buying. Many first-time buyers choose Navi Mumbai or Thane for affordability.' },
  { profile: 'couple', city: 'delhi', incomeRange: [100000, 300000], insight: 'Couples in Delhi NCR with combined income ₹1-3L typically buy in Noida/Greater Noida within 4-5 years. Dwarka remains popular for resale flats.' },
  { profile: 'couple', city: 'pune', incomeRange: [120000, 300000], insight: 'Pune couples earning ₹1.2-3L buy early — often within 2-3 years. Undri, Wagholi, and Kharadi offer affordable 2BHKs under ₹60L.' },
  { profile: 'couple', city: 'hyderabad', incomeRange: [120000, 300000], insight: 'Couples in Hyderabad are among the fastest to buy in India. With ₹1.2L+ combined income, most purchase within 2-3 years in Miyapur or Kukatpally.' },
  { profile: 'couple', city: 'chennai', incomeRange: [100000, 250000], insight: 'Chennai couples typically rent in T. Nagar or Anna Nagar, then buy in OMR/Siruseri after 4-5 years as IT corridors develop.' },

  // Families
  { profile: 'family', city: 'bengaluru', incomeRange: [200000, 600000], insight: 'Families in Bengaluru prioritize school proximity. Whitefield and Sarjapur Road dominate family purchases. Most buy 3BHKs within 2 years of having kids.' },
  { profile: 'family', city: 'mumbai', incomeRange: [300000, 800000], insight: 'Mumbai families with kids almost always prefer buying — school admission forms ask for address proof. Powai and Chembur are popular family areas.' },
  { profile: 'family', city: 'delhi', incomeRange: [150000, 400000], insight: 'Delhi families strongly prefer ownership for stability. Vasant Kunj, Saket, and Dwarka are top choices. Most buy within 1-2 years of starting a family.' },
  { profile: 'family', city: 'pune', incomeRange: [150000, 400000], insight: 'Pune families favor Aundh, Baner, and Kothrud for schools. 3BHKs in established areas are the most sought-after family property type.' },
  { profile: 'family', city: 'hyderabad', incomeRange: [150000, 400000], insight: 'Hyderabad families buy early — often before the first child. Kondapur and Nallagandla are emerging family neighborhoods with good schools.' },
  { profile: 'family', city: 'chennai', incomeRange: [150000, 350000], insight: 'Chennai families have the strongest preference for ownership in India. Most buy as soon as financially possible, often taking loans from family.' },

  // Retired
  { profile: 'retired', city: 'bengaluru', incomeRange: [30000, 100000], insight: 'Retired individuals in Bengaluru increasingly sell large homes and move to managed senior living in Devanahalli or Yelahanka.' },
  { profile: 'retired', city: 'mumbai', incomeRange: [40000, 150000], insight: 'Retired Mumbaikars rarely sell their property. Those who do typically move to Pune, Nashik, or Goa for a quieter lifestyle at lower cost.' },
  { profile: 'retired', city: 'pune', incomeRange: [30000, 100000], insight: 'Pune is India\'s top retirement destination. Many retirees from Mumbai sell and buy larger homes in Baner, Pashan, or Lavasa.' },
  { profile: 'retired', city: 'chennai', incomeRange: [25000, 80000], insight: 'Chennai retirees strongly prefer owning. Renting in old age is culturally unusual. Most already own and plan to stay in their current home.' },

  // Generic fallbacks
  { profile: 'bachelor', city: 'other', incomeRange: [0, 9999999], insight: 'In tier-2 cities, bachelors often buy earlier than in metros due to lower property prices and stronger family pressure to invest in real estate.' },
  { profile: 'couple', city: 'other', incomeRange: [0, 9999999], insight: 'Couples in tier-2 cities typically buy within 2-3 years of marriage. Property is still seen as the primary investment vehicle.' },
  { profile: 'family', city: 'other', incomeRange: [0, 9999999], insight: 'Families in smaller cities almost always own their home. Renting is uncommon and often seen as temporary.' },
  { profile: 'retired', city: 'other', incomeRange: [0, 9999999], insight: 'Retirees in smaller cities universally own. The concept of renting in retirement is virtually non-existent outside metros.' },
];

export function getBenchmark(profile: string, city: string, monthlyIncome: number): Benchmark | null {
  // Try exact city + profile + income match first
  const exact = BENCHMARKS.find(b =>
    b.profile === profile &&
    b.city === city &&
    monthlyIncome >= b.incomeRange[0] &&
    monthlyIncome <= b.incomeRange[1]
  );
  if (exact) return exact;

  // Try city + profile without income
  const cityMatch = BENCHMARKS.find(b => b.profile === profile && b.city === city);
  if (cityMatch) return cityMatch;

  // Fallback to 'other' city
  const fallback = BENCHMARKS.find(b => b.profile === profile && b.city === 'other');
  return fallback ?? null;
}
