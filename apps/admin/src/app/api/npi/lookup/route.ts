import { NextRequest, NextResponse } from 'next/server';

const NPPES_API_URL = 'https://npiregistry.cms.hhs.gov/api/';

export interface NPIResult {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  licenseNumber?: string;
  licenseState?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const npi = searchParams.get('npi');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const state = searchParams.get('state');

    // Build query params for NPPES API
    const params = new URLSearchParams({ version: '2.1' });

    if (npi) {
      params.append('number', npi);
    } else {
      if (firstName) params.append('first_name', firstName);
      if (lastName) params.append('last_name', lastName);
      if (state) params.append('state', state);
      params.append('enumeration_type', 'NPI-1'); // Individual providers only
    }

    params.append('limit', '10');

    const response = await fetch(`${NPPES_API_URL}?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to simpler format
    const results: NPIResult[] = (data.results || []).map((r: any) => {
      const primaryAddress = r.addresses?.find((a: any) => a.address_purpose === 'LOCATION') || r.addresses?.[0];
      const primaryTaxonomy = r.taxonomies?.find((t: any) => t.primary) || r.taxonomies?.[0];

      return {
        npi: r.number,
        firstName: r.basic?.first_name || '',
        lastName: r.basic?.last_name || '',
        credential: r.basic?.credential || '',
        specialty: primaryTaxonomy?.desc || '',
        address: {
          street: primaryAddress?.address_1 || '',
          city: primaryAddress?.city || '',
          state: primaryAddress?.state || '',
          zip: primaryAddress?.postal_code || '',
          phone: primaryAddress?.telephone_number || '',
        },
        licenseNumber: primaryTaxonomy?.license,
        licenseState: primaryTaxonomy?.state,
      };
    });

    return NextResponse.json({
      success: true,
      count: data.result_count || 0,
      results,
    });
  } catch (error: any) {
    console.error('NPI lookup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'NPI lookup failed' },
      { status: 500 }
    );
  }
}
