export interface LocalityProfile {
  canonicalName: string;
  aliases?: string[];
  zone: string;
  segment: 'ultra_luxury' | 'premium' | 'upper_mid' | 'mid_market' | 'affordable';
  vibe: string;
  dominantTenantProfile: string;
  priceToRentPressure: 'very_high' | 'high' | 'balanced' | 'low';
  appreciationOutlook: 'strong' | 'steady' | 'patchy';
  liquidity: 'strong' | 'moderate' | 'weaker';
  safety: 'strong' | 'mixed' | 'weaker';
  commute: string;
  infraCatalysts: string[];
  risks: string[];
  betterValueAlternatives: string[];
  summary: string;
}

const CITY_LOCALITIES: Record<string, LocalityProfile[]> = {
  delhi: [
    {
      canonicalName: 'Lodhi Estate',
      aliases: ['lodhi estate', 'lodhi colony', 'lodhi road'],
      zone: 'Central Delhi',
      segment: 'ultra_luxury',
      vibe: 'leafy diplomatic enclave with scarce supply and institutional neighbors',
      dominantTenantProfile: 'diplomats, senior executives, policy professionals',
      priceToRentPressure: 'very_high',
      appreciationOutlook: 'steady',
      liquidity: 'strong',
      safety: 'strong',
      commute: 'excellent central connectivity but premium pricing is driven by scarcity more than rental economics',
      infraCatalysts: ['Central Delhi address premium', 'institutional belt', 'easy access to Khan Market and India Habitat Centre'],
      risks: ['extreme capital values', 'very low rental yield', 'limited fresh inventory'],
      betterValueAlternatives: ['Jangpura', 'Defence Colony', 'Mayur Vihar Phase 1'],
      summary: 'A trophy micro-market where buyers pay for status, centrality and scarcity; rental math is usually weak even when livability is excellent.',
    },
    {
      canonicalName: 'Shahdara',
      aliases: ['shahdara', 'shadara'],
      zone: 'East Delhi',
      segment: 'affordable',
      vibe: 'dense old-city housing stock with value pricing and heavy everyday congestion',
      dominantTenantProfile: 'value-conscious families and local business households',
      priceToRentPressure: 'balanced',
      appreciationOutlook: 'patchy',
      liquidity: 'moderate',
      safety: 'mixed',
      commute: 'metro access helps, but last-mile congestion and older infrastructure drag daily convenience',
      infraCatalysts: ['Red Line connectivity', 'relative affordability versus central Delhi'],
      risks: ['older housing stock', 'traffic bottlenecks', 'mixed civic quality', 'weaker premium resale demand'],
      betterValueAlternatives: ['Dilshad Garden', 'Vivek Vihar', 'Noida Sector 62'],
      summary: 'A budget-led market where affordability is the main story; buy decisions hinge more on building quality and livability than prestige or premium appreciation.',
    },
    {
      canonicalName: 'Burari',
      aliases: ['burari', 'buradi'],
      zone: 'North Delhi fringe',
      segment: 'affordable',
      vibe: 'fast-growing peripheral colony belt with mixed plotted stock, unauthorized pockets and uneven civic upkeep',
      dominantTenantProfile: 'budget families, local traders and first-time buyers stretching for ownership',
      priceToRentPressure: 'balanced',
      appreciationOutlook: 'patchy',
      liquidity: 'weaker',
      safety: 'mixed',
      commute: 'road-led connectivity to north and central Delhi exists, but choke points and weak last-mile quality make daily reliability inconsistent',
      infraCatalysts: ['outer north Delhi expansion', 'relative affordability versus central Delhi', 'buyer demand from budget upgraders'],
      risks: ['unauthorized or non-uniform stock in some pockets', 'civic infrastructure gaps', 'weaker resale depth', 'congestion on approach roads'],
      betterValueAlternatives: ['Rohini Sector 24', 'Mukherjee Nagar', 'Dilshad Garden'],
      summary: 'An affordability-driven fringe market where low entry price attracts first-time buyers, but execution risk sits in legality, stock quality and resale depth rather than headline pricing.',
    },
    {
      canonicalName: 'Dwarka',
      aliases: ['dwarka'],
      zone: 'South West Delhi',
      segment: 'upper_mid',
      vibe: 'planned sectors with family appeal and relatively organized housing stock',
      dominantTenantProfile: 'families and salaried professionals',
      priceToRentPressure: 'high',
      appreciationOutlook: 'steady',
      liquidity: 'moderate',
      safety: 'mixed',
      commute: 'works well for airport and west Delhi access but long trips to Gurgaon or central hubs can be draining',
      infraCatalysts: ['airport connectivity', 'sector planning', 'expressway links'],
      risks: ['price appreciation can be slow in mature pockets', 'commute mismatch for many office corridors'],
      betterValueAlternatives: ['Janakpuri', 'Palam Vihar', 'Noida Sector 137'],
      summary: 'Good for stability-first households, but not always the best capital-efficiency play unless your work and life are concentrated nearby.',
    },
    {
      canonicalName: 'Saket',
      aliases: ['saket'],
      zone: 'South Delhi',
      segment: 'premium',
      vibe: 'established South Delhi neighborhood with mall, hospital and metro convenience',
      dominantTenantProfile: 'professionals, affluent families, expats',
      priceToRentPressure: 'very_high',
      appreciationOutlook: 'steady',
      liquidity: 'strong',
      safety: 'strong',
      commute: 'strong south-central access, but buyers often overpay for brand and convenience',
      infraCatalysts: ['Select Citywalk ecosystem', 'Yellow Line connectivity', 'hospital cluster'],
      risks: ['expensive entry point', 'older premium stock in some pockets'],
      betterValueAlternatives: ['Malviya Nagar', 'Kalkaji', 'Jasola'],
      summary: 'Livability is solid, but purchase pricing often bakes in most of the prestige premium upfront.',
    },
  ],
  mumbai: [
    {
      canonicalName: 'Powai',
      aliases: ['powai'],
      zone: 'Central Suburbs',
      segment: 'premium',
      vibe: 'master-planned lake district with corporate demand and brand premium',
      dominantTenantProfile: 'tech professionals and expats',
      priceToRentPressure: 'very_high',
      appreciationOutlook: 'steady',
      liquidity: 'strong',
      safety: 'strong',
      commute: 'good for SEEPZ/BKC-linked professionals but JVLR congestion hurts peak-hour reliability',
      infraCatalysts: ['corporate catchment', 'metro upgrades', 'Hiranandani brand effect'],
      risks: ['brand premium', 'JVLR traffic', 'high maintenance in gated stock'],
      betterValueAlternatives: ['Chandivali', 'Vikhroli', 'Mulund West'],
      summary: 'Convenient and aspirational, but buyers often pay ahead of fundamentals because the brand and tenant demand are so strong.',
    },
  ],
  bengaluru: [
    {
      canonicalName: 'Koramangala',
      aliases: ['koramangala'],
      zone: 'South East Bengaluru',
      segment: 'premium',
      vibe: 'startup-heavy, nightlife-rich micro-market with chronic traffic and expensive rentals',
      dominantTenantProfile: 'startup founders, young professionals, bachelors',
      priceToRentPressure: 'very_high',
      appreciationOutlook: 'steady',
      liquidity: 'strong',
      safety: 'mixed',
      commute: 'great social access, but peak-hour road bottlenecks make commute reliability poor',
      infraCatalysts: ['startup demand', 'central location', 'strong rental absorption'],
      risks: ['traffic chaos', 'limited inventory', 'high price per square foot'],
      betterValueAlternatives: ['HSR Layout', 'BTM Layout', 'Bellandur'],
      summary: 'Fantastic to live in if you value energy and access, but the buy premium is usually painful.',
    },
    {
      canonicalName: 'HSR Layout',
      aliases: ['hsr layout', 'hsr'],
      zone: 'South East Bengaluru',
      segment: 'upper_mid',
      vibe: 'planned grid with startup adjacency and strong family-renter balance',
      dominantTenantProfile: 'tech couples, young families, startup professionals',
      priceToRentPressure: 'high',
      appreciationOutlook: 'strong',
      liquidity: 'strong',
      safety: 'mixed',
      commute: 'solid for ORR and startup corridors, but arterial road congestion still bites',
      infraCatalysts: ['ORR demand', 'startup ecosystem', 'metro spillover'],
      risks: ['pricing has already run up', 'traffic around Silk Board spillovers'],
      betterValueAlternatives: ['BTM Layout', 'Haralur', 'Electronic City Phase 1'],
      summary: 'More balanced than Koramangala, but still a pricey bet if your stay horizon is short.',
    },
  ],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cityKey(city: string) {
  const normalized = normalize(city);
  if (normalized.includes('delhi')) return 'delhi';
  if (normalized.includes('ncr')) return 'delhi';
  if (normalized.includes('gurgaon')) return 'delhi';
  if (normalized.includes('noida')) return 'delhi';
  if (normalized.includes('mumbai')) return 'mumbai';
  if (normalized.includes('bengaluru') || normalized.includes('bangalore')) return 'bengaluru';
  return normalized;
}

export function getLocalityProfile(city: string, locality: string) {
  const normalizedLocality = normalize(locality);
  if (!normalizedLocality || normalizedLocality === 'not specified') {
    return null;
  }

  const entries = CITY_LOCALITIES[cityKey(city)] ?? [];
  const exactMatch = entries.find((entry) => {
    const names = [entry.canonicalName, ...(entry.aliases ?? [])].map(normalize);
    return names.some((name) => name === normalizedLocality || normalizedLocality.includes(name) || name.includes(normalizedLocality));
  });

  if (exactMatch) {
    return { ...exactMatch, matchConfidence: 'high' as const };
  }

  if (cityKey(city) === 'delhi') {
    if (/(estate|enclave|golf|defence|chanakya|lodhi)/.test(normalizedLocality)) {
      return {
        canonicalName: locality,
        zone: 'Central/South Delhi premium pocket',
        segment: 'premium',
        vibe: 'low-supply premium enclave with strong address value',
        dominantTenantProfile: 'affluent professionals and diplomats',
        priceToRentPressure: 'very_high',
        appreciationOutlook: 'steady',
        liquidity: 'strong',
        safety: 'strong',
        commute: 'central access is excellent, but pricing is driven more by prestige than pure financial logic',
        infraCatalysts: ['scarcity value', 'central connectivity'],
        risks: ['very low rental yield', 'high entry ticket'],
        betterValueAlternatives: ['Jangpura', 'Mayur Vihar Phase 1'],
        summary: 'This looks like a prestige-led Delhi micro-market where liveability is high but buy economics are usually unforgiving.',
        matchConfidence: 'medium' as const,
      };
    }

    if (/(burari|sant nagar|mukundpur|kaushik enclave)/.test(normalizedLocality)) {
      return {
        canonicalName: locality,
        zone: 'North Delhi fringe affordability market',
        segment: 'affordable',
        vibe: 'peripheral value-led housing market with uneven stock quality and civic consistency',
        dominantTenantProfile: 'budget families and first-time buyers',
        priceToRentPressure: 'balanced',
        appreciationOutlook: 'patchy',
        liquidity: 'weaker',
        safety: 'mixed',
        commute: 'connectivity exists, but approach-road congestion and last-mile quality often reduce convenience',
        infraCatalysts: ['affordability', 'north Delhi spillover demand'],
        risks: ['title and stock-quality variability', 'uneven civic infrastructure', 'slower resale depth'],
        betterValueAlternatives: ['Rohini Sector 24', 'Mukherjee Nagar'],
        summary: 'This looks like a fringe affordability market where the right block can work, but weak stock and resale quality can punish a rushed buyer.',
        matchConfidence: 'medium' as const,
      };
    }

    if (/(shahdara|laxmi nagar|dilshad|nangloi|seemapuri)/.test(normalizedLocality)) {
      return {
        canonicalName: locality,
        zone: 'East/outer Delhi value market',
        segment: 'affordable',
        vibe: 'budget-driven residential market with dense mixed-use streets',
        dominantTenantProfile: 'value-sensitive families and local workers',
        priceToRentPressure: 'balanced',
        appreciationOutlook: 'patchy',
        liquidity: 'moderate',
        safety: 'mixed',
        commute: 'mass transit helps but last-mile congestion and civic quality vary sharply by block',
        infraCatalysts: ['affordability', 'metro access'],
        risks: ['older stock', 'uneven civic infrastructure', 'quality varies building to building'],
        betterValueAlternatives: ['Vivek Vihar', 'Noida Sector 62'],
        summary: 'This looks like a value market where building quality matters more than broad-area appreciation stories.',
        matchConfidence: 'medium' as const,
      };
    }
  }

  return null;
}
