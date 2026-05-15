let state = {
    enabled: false,
    type: "server",
};

// GET → ให้หน้าเว็บอ่าน
export async function GET() {
    return Response.json(state);
}

// POST → ให้ bot ยิงมาเปลี่ยนค่า
export async function POST(req: Request) {
    const body = await req.json();

    if (typeof body.enabled === "boolean") {
        state.enabled = body.enabled;
    }

    if (body.type) {
        state.type = body.type;
    }

    return Response.json({
        success: true,
        state,
    });
}