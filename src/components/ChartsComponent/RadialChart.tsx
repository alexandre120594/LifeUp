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
    <Card className="flex min-w-0 flex-col overflow-hidden">
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle className="break-words text-base sm:text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[220px] max-h-[260px] w-full max-w-[260px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={anguloDinamico}
            innerRadius="62%"
            outerRadius="86%"
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
                          className="fill-foreground text-sm font-bold sm:text-[18px]"
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
      <CardFooter className="flex-col gap-2 text-center text-sm">
        {children}
      </CardFooter>
    </Card>
  );
}
