import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { type ReactNode, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import OutputFieldContainer from "../../components/OutputFieldContainer";
import { useCurrentMessage, useCurrentMessageOutput } from "../../contexts/CurrentMessage";

export type GoogleSearchSourcesViewPropValue =
  | Array<{
      title: string;
      link: string;
      snippet?: string;
      favicon?: string;
      source?: string;
    }>
  | undefined;

const COLLAPSE_SIZE = 3;

export default function GoogleSearchSourcesView() {
  const { outputValue, output } = useCurrentMessageOutput<GoogleSearchSourcesViewPropValue>();

  const { message } = useCurrentMessage({ optional: true }) ?? {};
  const [showAll, setShowAll] = useState(false);

  const handleToggle = () => setShowAll(!showAll);

  if (!outputValue?.length && !message?.loading) return null;

  const list = outputValue || [];
  const itemsToShow = showAll
    ? list
    : list.slice(0, list.length > COLLAPSE_SIZE ? COLLAPSE_SIZE - 1 : COLLAPSE_SIZE);

  return (
    <OutputFieldContainer output={output}>
      <Grid container spacing={1.5}>
        {message?.loading && !list.length && (
          <>
            <Grid item xs={4} sm={4} md={4}>
              <ItemSkeleton />
            </Grid>

            <Grid item xs={4} sm={4} md={4}>
              <ItemSkeleton />
            </Grid>

            <Grid item xs={4} sm={4} md={4}>
              <ItemSkeleton />
            </Grid>
          </>
        )}
        <TransitionGroup component={null}>
          {itemsToShow.map((item) => (
            <CSSTransition key={item.link} timeout={500} classNames="item">
              <Grid item xs={4} sm={4} md={4}>
                <ItemView item={item} />
              </Grid>
            </CSSTransition>
          ))}
        </TransitionGroup>

        {!showAll && list.length > COLLAPSE_SIZE && (
          <Grid item xs={4} sm={4} md={4}>
            <MoreItemView list={list} onMore={handleToggle} />
          </Grid>
        )}
      </Grid>
    </OutputFieldContainer>
  );
}

function ItemView({ item }: { item: NonNullable<GoogleSearchSourcesViewPropValue>[number] }) {
  return (
    <ItemContainer
      title={`${item.title} - ${item.source}`}
      favicon={
        <Avatar src={item.favicon} sx={{ width: 18, height: 18 }}>
          {item.source?.slice(0, 1)}
        </Avatar>
      }
      link={item.link}
    />
  );
}

function MoreItemView({
  list,
  onMore,
}: { list: GoogleSearchSourcesViewPropValue; onMore: () => void }) {
  const current = list?.slice(COLLAPSE_SIZE - 1);

  if (!current?.length) return null;

  return (
    <Card sx={{ height: "100px", cursor: "pointer" }} onClick={onMore}>
      <Stack sx={{ py: 1.5, px: 2, gap: 1, height: "100%" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "7px", flexGrow: 1 }}>
          {current.map((item) => {
            return (
              <Box key={item.link} width={18} height={18}>
                <Avatar src={item.favicon} sx={{ width: 18, height: 18 }}>
                  {item.source?.slice(0, 1)}
                </Avatar>
              </Box>
            );
          })}
        </Box>

        <Typography
          variant="caption"
          noWrap
          sx={{ width: 1, color: "#546C70", fontSize: 12, lineHeight: "18px" }}
        >
          {`View ${current.length} more`}
        </Typography>
      </Stack>
    </Card>
  );
}

function ItemSkeleton() {
  return (
    <ItemContainer
      title={
        <>
          <Skeleton width="100%" />
          <Skeleton width="40%" />
        </>
      }
      favicon={<Skeleton width={18} height={18} variant="circular" />}
      link={<Skeleton width="70%" />}
    />
  );
}

function ItemContainer({
  title,
  favicon,
  link,
}: { title: ReactNode; favicon: ReactNode; link: ReactNode }) {
  return (
    <Card sx={{ height: "100px" }}>
      <CardActionArea
        component="a"
        href={typeof link === "string" ? link : undefined}
        target="_blank"
        sx={{ height: "100%" }}
      >
        <Stack sx={{ py: 1.5, px: 2, gap: 1, height: "100%" }}>
          <Box flexGrow={1}>
            <Typography
              variant="body2"
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
          </Box>

          <Stack flexDirection="row" alignItems="center" gap={1} overflow="hidden">
            <Box width={18} height={18}>
              {favicon}
            </Box>

            <Typography variant="caption" noWrap sx={{ flex: 1, width: 1 }}>
              {link}
            </Typography>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
