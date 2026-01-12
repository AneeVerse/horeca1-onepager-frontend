import { NextResponse } from "next/server";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5055/v1";
const apiBase = baseURL.endsWith('/v1') ? baseURL : `${baseURL}/v1`;

export async function PUT(request, { params }) {
    try {
        // In Next.js 15, params must be awaited
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const body = await request.json();
        const { name, phone, email, address } = body;

        if (!id) {
            return NextResponse.json(
                { message: "Customer ID is required" },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!name || !phone) {
            return NextResponse.json(
                { message: "Name and phone are required fields" },
                { status: 400 }
            );
        }

        // Call backend API to update customer
        const response = await fetch(`${apiBase}/customer/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                phone,
                email: email || undefined,
                address: address || undefined,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Failed to update customer" },
                { status: response.status }
            );
        }

        // Return updated customer data
        return NextResponse.json(
            {
                message: data.message || "Customer updated successfully",
                customer: {
                    _id: data._id,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    createdAt: data.createdAt,
                    status: "Active",
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
