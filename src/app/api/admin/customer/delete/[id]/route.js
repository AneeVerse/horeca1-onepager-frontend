import { NextResponse } from "next/server";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5055/v1";
const apiBase = baseURL.endsWith('/v1') ? baseURL : `${baseURL}/v1`;

export async function DELETE(request, { params }) {
    try {
        // In Next.js 15, params must be awaited
        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { message: "Customer ID is required" },
                { status: 400 }
            );
        }

        // Call backend API to delete customer
        const response = await fetch(`${apiBase}/customer/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Backend returned non-JSON response: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Failed to delete customer" },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { message: data.message || "Customer deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
