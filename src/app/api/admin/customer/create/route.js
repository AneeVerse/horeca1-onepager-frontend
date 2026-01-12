import { NextResponse } from "next/server";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5055/v1";
const apiBase = baseURL.endsWith('/v1') ? baseURL : `${baseURL}/v1`;

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phone, email, address, city, country, zipCode } = body;

        // Validate required fields
        if (!name || !phone) {
            return NextResponse.json(
                { message: "Name and phone are required fields" },
                { status: 400 }
            );
        }

        // Call backend API to create customer
        const response = await fetch(`${apiBase}/customer/admin/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                phone,
                email: email || undefined,
                address: address || undefined,
                city: city || undefined,
                country: country || undefined,
                zipCode: zipCode || undefined,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Failed to create customer" },
                { status: response.status }
            );
        }

        return NextResponse.json(
            {
                message: data.message || "Customer created successfully",
                customer: data.customer
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
