import { Icon } from "@iconify/react";
import { Box, Link, styled } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import type React from "react";
import { isValidElement, type ReactNode } from "react";

export interface MetricProps {
  icon?: string | ReactNode;
  value: string | ReactNode;
  title: string | ReactNode;
  url?: string;
  animated?: boolean;
  LinkComponent?: React.ElementType;
  loading?: boolean;
  size?: "small" | "normal";
}

export default function Metric({
  icon,
  value,
  title: name,
  url = "",
  animated = false,
  LinkComponent = Link,
  loading = false,
}: MetricProps) {
  const renderIcon = () => {
    if (isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "string") {
      return <Box component={Icon} icon={icon} sx={{ fontSize: 30 }} />;
    }
    return null;
  };

  if (loading) {
    return (
      <Container>
        {icon && (
          <Box className="metric__image">
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        )}
        <Box>
          <Skeleton
            className={`metric__number ${animated ? "metric__number--animated" : ""}`}
            variant="rounded"
            width={160}
            height="36px"
            sx={{ mb: 1 }}
          />
          <Skeleton className="metric__name" variant="rounded" width={80} height={20} />
        </Box>
      </Container>
    );
  }

  const metric = (
    <>
      {icon && <Box className="metric__image">{renderIcon()}</Box>}
      <Box>
        {isValidElement(value) ? (
          <Box className={`metric__number ${animated ? "metric__number--animated" : ""}`}>
            {value}
          </Box>
        ) : (
          <Box
            component="div"
            className={`metric__number ${animated ? "metric__number--animated" : ""}`}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{ __html: value as string }}
          />
        )}
        <Box className="metric__name">{name}</Box>
      </Box>
    </>
  );

  return (
    <Container>
      {url ? (
        <LinkComponent href={url} style={{ textDecoration: "none" }}>
          {metric}
        </LinkComponent>
      ) : (
        metric
      )}
    </Container>
  );
}

const Container = styled(Box)<{ size?: "small" | "normal" }>`
  border-left: 1px solid ${(props) => props.theme.palette.divider};
  padding: 10px 0 10px 16px;
  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    padding: 0 0 0 8px;
  }

  display: flex;
  justify-items: center;
  align-items: flex-start;

  a {
    display: flex;
    justify-items: center;
    align-items: flex-start;
  }

  .metric__image {
    margin-right: 8px;
    margin-top: 2px;
  }

  .metric__number {
    margin-bottom: 8px;
    font-size: ${(props) => (props.size === "small" ? 32 : 36)}px;
    font-weight: 600;
    line-height: 36px;
    color: ${(props) => props.theme.typography.color.main};

    small {
      font-size: 12px;
      line-height: 12px;
    }

    @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
      font-size: ${(props) => (props.size === "small" ? 24 : 28)}px;
      line-height: ${(props) => (props.size === "small" ? 24 : 28)}px;
      margin-bottom: 2px;
    }
  }

  .metric__number--animated {
    animation-name: blink-opacity;
    animation-duration: 250ms;
    animation-timing-function: linear;
    animation-iteration-count: 1;
    background-color: transparent !important;
  }

  .metric__name {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 1.2;
    font-weight: 500;
    color: ${(props) => props.theme.typography.color.main};
    @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
      font-size: 10px;
      line-height: 1;
    }
  }

  @keyframes blink-opacity {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
`;
