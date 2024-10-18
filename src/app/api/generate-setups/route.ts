import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { userNeeds, budget } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en componentes de computadoras. Genera 3 setups de PC basados en las necesidades del usuario y el presupuesto proporcionado. Cada setup debe incluir una lista de componentes y una estimación de rendimiento.",
        },
        {
          role: "user",
          content: `Necesidades: ${userNeeds}\nPresupuesto: ${
            budget || "No especificado"
          }`,
        },
      ],
    });

    const setups =
      completion.choices[0].message?.content
        ?.split("\n\n")
        .filter((setup) => setup.trim() !== "")
        .map((setup) => {
          const lines = setup.split("\n");
          const components = lines.slice(1, -1);
          const performance = lines[lines.length - 1] || "";
          return {
            components: components.map((c) => c.replace(/^- /, "")),
            performance: performance.replace(/^Rendimiento: /, ""),
          };
        }) || [];

    return NextResponse.json(setups);
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: "Error generating setups" },
      { status: 500 }
    );
  }
}
