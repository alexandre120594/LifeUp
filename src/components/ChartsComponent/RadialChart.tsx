"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

type RadialChartDatum = {
  data: number;
  fill?: string;
  [key: string]: string | number | undefined;
};

interface RadialText {
  title: string;
  description: string;
  chartConfig: ChartConfig;
  chartData: RadialChartDatum[] | undefined;
  type: string;
  children: React.ReactNode;
  tamanho: number | undefined;
}

export function ChartRadialText({
  title,
  chartConfig,
  chartData,
  children,
  description,
  type,
  tamanho,
}: RadialText) {
  const valorAtual = chartData?.[0]?.data || 0;
  const meta = tamanho || 0;

  const anguloDinamico = meta > 0 ? (valorAtual / meta) * 360 : 0;
  return (
    <Card className="grid grid-cols-2  md:flex md:flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={anguloDinamico}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey={"data"} background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-[18px] font-bold"
                        >
                          {valorAtual.toLocaleString()} / {meta}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {type}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col  gap-2 text-sm">{children}</CardFooter>
    </Card>
  );
}
