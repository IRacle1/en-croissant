import { ANNOTATION_INFO } from "@/utils/annotation";
import { positionFromFen } from "@/utils/chessops";
import { skipWhile, takeWhile } from "@/utils/misc";
import { formatScore } from "@/utils/score";
import {
  type ListNode,
  type TreeNode,
  treeIteratorMainLine,
} from "@/utils/treeReducer";
import { AreaChart } from "@mantine/charts";
import {
  Box,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import equal from "fast-deep-equal";
import { useContext } from "react";
import type { CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart";
import { useStore } from "zustand";
import * as classes from "./EvalChart.css";
import { TreeStateContext } from "./TreeStateContext";

interface EvalChartProps {
  isAnalysing: boolean;
  startAnalysis: () => void;
}

type DataPoint = {
  name: string;
  evalText: string;
  yValue: number | "none";
  movePath: number[];
  color: string;
};

const EvalChart = (props: EvalChartProps) => {
  const store = useContext(TreeStateContext)!;
  const root = useStore(store, (s) => s.root);
  const position = useStore(store, (s) => s.position);
  const goToMove = useStore(store, (s) => s.goToMove);
  const theme = useMantineTheme();

  function getYValue(node: TreeNode): number | undefined {
    if (node.score) {
      let cp: number = node.score.value.value;
      if (node.score.value.type === "mate") {
        cp =
          node.score.value.value > 0
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY;
      }
      return 2 / (1 + Math.exp(-0.004 * cp)) - 1;
    }
    if (node.children.length === 0) {
      const [pos, error] = positionFromFen(node.fen);
      if (pos) {
        if (pos.isCheckmate()) {
          return pos?.turn === "white" ? -1 : 1;
        }
        if (pos.isStalemate()) {
          return 0;
        }
      }
    }
  }

  function getEvalText(node: TreeNode): string {
    if (node.score) {
      return `Advantage: ${formatScore(node.score.value)}`;
    }
    if (node.children.length === 0) {
      const [pos, error] = positionFromFen(node.fen);
      if (pos) {
        if (pos.isCheckmate()) return "Checkmate";
        if (pos.isStalemate()) return "Stalemate";
      }
    }
    return "Not analysed";
  }

  function getNodes(): ListNode[] {
    const allNodes = treeIteratorMainLine(root);
    const withoutRoot = skipWhile(
      allNodes,
      (node: ListNode) => node.position.length === 0,
    );
    const withMoves = takeWhile(
      withoutRoot,
      (node: ListNode) => node.node.move !== undefined,
    );
    return [...withMoves];
  }

  function* getData(): Iterable<DataPoint> {
    const nodes = getNodes();
    for (let i = 0; i < nodes.length; i++) {
      const currentNode = nodes[i];
      const yValue = getYValue(currentNode.node);
      const [pos] = positionFromFen(currentNode.node.fen);

      yield {
        name: `${Math.ceil(currentNode.node.halfMoves / 2)}.${
          pos?.turn === "black" ? "" : ".."
        } ${currentNode.node.san}${currentNode.node.annotations}`,
        evalText: getEvalText(currentNode.node),
        yValue: yValue ?? "none",
        movePath: currentNode.position,
        color:
          ANNOTATION_INFO[currentNode.node.annotations[0]]?.color || "gray",
      };
    }
  }

  function gradientOffset(data: DataPoint[]) {
    const dataMax = Math.max(
      ...data.map((i) => (i.yValue !== "none" ? i.yValue : 0)),
    );
    const dataMin = Math.min(
      ...data.map((i) => (i.yValue !== "none" ? i.yValue : 0)),
    );

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload: any;
  }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const dataPoint: DataPoint = payload[0].payload;
      return (
        <Paper px="md" py="sm" withBorder shadow="md" radius="md">
          <Text
            className={classes.tooltipTitle}
            c={dataPoint.color === "gray" ? undefined : dataPoint.color}
          >
            {dataPoint.name}
          </Text>
          <Text>{dataPoint.evalText}</Text>
        </Paper>
      );
    }
    return null;
  };

  const onChartClick: CategoricalChartFunc = (data) => {
    if (data?.activePayload?.length && data.activePayload[0].payload) {
      const dataPoint: DataPoint = data.activePayload[0].payload;
      goToMove(dataPoint.movePath);
    }
  };

  const data = [...getData()];
  const currentPositionName = data.find((point) =>
    equal(point.movePath, position),
  )?.name;
  const colouroffset = gradientOffset(data);

  return (
    <Stack>
      <Box pos="relative">
        <LoadingOverlay visible={props.isAnalysing === true} />
        <AreaChart
          h={150}
          curveType="monotone"
          data={data}
          dataKey={"name"}
          series={[
            { name: "yValue", color: theme.colors[theme.primaryColor][7] },
          ]}
          connectNulls={false}
          withXAxis={false}
          withYAxis={false}
          yAxisProps={{ domain: [-1, 1] }}
          type="split"
          fillOpacity={0.8}
          splitColors={["gray.1", "black"]}
          splitOffset={colouroffset}
          activeDotProps={{ r: 3, strokeWidth: 1 }}
          dotProps={{ r: 0 }}
          referenceLines={[
            {
              x: currentPositionName,
              color: theme.colors[theme.primaryColor][7],
            },
          ]}
          areaChartProps={{
            onClick: onChartClick,
            style: { cursor: "pointer" },
          }}
          gridAxis="none"
          tooltipProps={{
            content: ({ payload, active }) => (
              <CustomTooltip active={active} payload={payload} />
            ),
          }}
        />
      </Box>
    </Stack>
  );
};

export default EvalChart;
