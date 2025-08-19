import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Typography } from "@mui/material";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import type { ImageData, LinkData } from "../libs/db.ts";

const markdownComponents = {
  a: (props: any) => <span>{props.children}</span>,
};

interface MessageBubbleProps {
  id: string;
  message: string;
  isUser: boolean;
  isLast: boolean;
  links?: LinkData[];
  images?: ImageData[];
}

function MessageBubble({ message, isUser, links = [], images = [] }: MessageBubbleProps) {
  const { t } = useLocaleContext();
  const [isLinksExpanded, setIsLinksExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({});
  const [currentImageUrls, setCurrentImageUrls] = useState<Record<string, string>>({});
  const [validImages, setValidImages] = useState<ImageData[]>([]);

  // Initialize valid images when images prop changes
  useEffect(() => {
    if (images && images.length > 0) {
      setValidImages(images);
      // Only reset states if images array actually changed
      const imageKeys = images.map((img) => img.link);
      setImageLoadStates((prev) => {
        const newStates: Record<string, "loading" | "loaded" | "error"> = {};
        imageKeys.forEach((key) => {
          // Keep existing state for images that are still present
          newStates[key] = prev[key] || "loading";
        });
        return newStates;
      });
      setCurrentImageUrls((prev) => {
        const newUrls: Record<string, string> = {};
        images.forEach((img) => {
          // Keep existing URL for images that are still present, otherwise use thumbnail
          newUrls[img.link] = prev[img.link] || img.thumbnail;
        });
        return newUrls;
      });
    } else {
      // No images, clear everything
      setValidImages([]);
      setImageLoadStates({});
      setCurrentImageUrls({});
    }
  }, [images.length]);

  // 提取 tab 标记
  const tabRegex = /<tab:\s*([^>]+)>/g;
  const tabMatches = message.match(tabRegex) || [];
  const tabUrls = tabMatches
    .map((match) => match.match(/<tab:\s*([^>]+)>/)?.[1] || "")
    .filter((url: string) => url.startsWith("http"));

  // 移除消息中的 tab 标记
  const cleanMessage = message.replace(tabRegex, "");

  const handleImageLoad = (imageKey: string, actualUrl: string) => {
    setImageLoadStates((prev) => ({ ...prev, [imageKey]: "loaded" }));
    setCurrentImageUrls((prev) => ({ ...prev, [imageKey]: actualUrl }));
  };

  const handleImageError = (imageKey: string, image: ImageData, isThumbnailError: boolean) => {
    if (isThumbnailError) {
      // 如果是缩略图失败，尝试原图
      setImageLoadStates((prev) => ({ ...prev, [imageKey]: "loading" }));
      setCurrentImageUrls((prev) => ({ ...prev, [imageKey]: image.original }));
    } else {
      // 如果原图也失败，从validImages中移除该图片
      setValidImages((prev) => prev.filter((img) => img.link !== imageKey));
      setImageLoadStates((prev) => ({ ...prev, [imageKey]: "error" }));
    }
  };

  const getImageLoadState = (imageKey: string) => {
    return imageLoadStates[imageKey] || "loading";
  };

  const getCurrentImageUrl = (imageKey: string, thumbnailUrl: string) => {
    return currentImageUrls[imageKey] || thumbnailUrl;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        pb: 2.5,
        pt: 2.5,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          width: "100%",
          gap: 1,
        }}
      >
        <Box style={{ maxWidth: isUser ? "79%" : "100%", alignSelf: "flex-start" }} sx={{}}>
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            {!isUser && validImages && validImages.length > 0 && (
              <Box
                sx={{
                  width: "100%",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    overflowX: "auto",
                    pb: 1,
                    "&::-webkit-scrollbar": {
                      height: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "2px",
                    },
                  }}
                >
                  {validImages.slice(0, 3).map((image, index) => {
                    const imageKey = image.original;
                    if (imageLoadStates[imageKey] === "error") return null;
                    const loadState = getImageLoadState(imageKey);
                    const currentUrl = getCurrentImageUrl(imageKey, image.thumbnail);
                    return (
                      <Box
                        key={image.original}
                        onClick={(e) => {
                          e.preventDefault();
                          if (loadState === "loaded") {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }
                        }}
                        sx={{
                          display: "block",
                          borderRadius: "2px",
                          overflow: "hidden",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                          width: "120px",
                          height: "80px",
                          position: "relative",
                          cursor: loadState === "loaded" ? "pointer" : "default",
                          "&:hover":
                            loadState === "loaded"
                              ? {
                                  transform: "scale(1.02)",
                                  borderColor: "rgba(130, 170, 255, 0.3)",
                                }
                              : {},
                        }}
                      >
                        {/* Loading Placeholder */}
                        {loadState === "loading" && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              zIndex: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: "20px",
                                height: "20px",
                                border: "2px solid rgba(255, 255, 255, 0.2)",
                                borderTop: "2px solid rgba(255, 255, 255, 0.6)",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                "@keyframes spin": {
                                  "0%": { transform: "rotate(0deg)" },
                                  "100%": { transform: "rotate(360deg)" },
                                },
                              }}
                            />
                          </Box>
                        )}

                        {/* Actual Image */}
                        <Box
                          component="img"
                          src={currentUrl}
                          alt={image.title}
                          crossOrigin="anonymous"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: loadState === "loaded" ? "block" : "none",
                          }}
                          onLoad={() => {
                            handleImageLoad(imageKey, currentUrl);
                          }}
                          onError={(e) => {
                            // 判断是缩略图失败还是原图失败
                            const isThumbnailError = e.currentTarget.src === image.thumbnail;
                            if (isThumbnailError && e.currentTarget.src !== image.original) {
                              // 缩略图失败，切换到原图
                              e.currentTarget.src = image.original;
                              handleImageError(imageKey, image, true);
                            } else {
                              // 原图也失败，移除图片
                              handleImageError(imageKey, image, false);
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                display: "inline-block",
                width: "100%",
                ...(isUser && {
                  p: "8px 14px",
                  borderRadius: "16px 16px 4px 16px",
                  bgcolor: "rgba(255, 255,255, 0.15)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }),
                "& .wmde-markdown": {
                  backgroundColor: "transparent",
                  color: "white",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  "& pre": {
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    padding: "8px 12px",
                    margin: "8px 0",
                    borderRadius: "6px",
                  },
                  "& code": {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    fontSize: "0.9em",
                    color: "white",
                  },
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    margin: "12px 0 4px",
                    borderBottom: "none",
                    padding: 0,
                    color: "white",
                  },
                  "& ul, & ol": {
                    paddingLeft: "32px",
                    margin: "4px 0",
                  },
                  "& ol": {
                    "& li::marker": {
                      fontVariantNumeric: "tabular-nums",
                      minWidth: "24px",
                      textAlign: "right",
                    },
                  },
                  "& li + li": {
                    margin: "2px 0",
                  },
                  "& p": {
                    margin: "4px 0",
                    color: "white",
                  },
                  "& a": {
                    color: "#82aaff",
                  },
                  "& table": {
                    margin: "8px 0",
                    "& th, & td": {
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      padding: "4px 8px",
                      color: "white",
                      background: "transparent !important",
                    },
                    "& tr": {
                      background: "transparent !important",
                    },
                  },
                  "& blockquote": {
                    borderLeft: "4px solid rgba(130, 170, 255, 0.4)",
                    margin: "8px 0",
                    padding: "0 8px",
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "& hr": {
                    margin: "12px 0",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "& answer": {
                    fontSize: "1.15rem",
                    fontWeight: "bold",
                    display: "block",
                    margin: "8px 0",
                    color: "white",
                  },
                },
              }}
            >
              {isUser ? (
                <Typography
                  variant="body1"
                  color="white"
                  sx={{ wordBreak: "break-word", fontSize: "0.95rem" }}
                >
                  {message}
                </Typography>
              ) : (
                <MarkdownPreview
                  style={{ wordBreak: "break-word" }}
                  source={cleanMessage}
                  components={markdownComponents}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {!isUser && tabUrls.length > 0 && (
        <Box
          sx={{
            mt: 1,
            width: "100%",
            ...(tabUrls.length > 3 && {
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                height: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "2px",
              },
            }),
          }}
        ></Box>
      )}

      {!isUser && links && links.length > 0 && (
        <Box
          sx={{
            mt: 1.5,
            width: "100%",
          }}
        >
          {/* 折叠/展开按钮 */}
          <Box
            onClick={() => setIsLinksExpanded(!isLinksExpanded)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: isLinksExpanded ? 0.8 : 0,
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              userSelect: "none",
              transition: "color 0.2s ease",
              "&:hover": {
                color: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            <Box>{t("reference_links")}</Box>
            {isLinksExpanded ? (
              <ExpandLessIcon sx={{ fontSize: "16px" }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: "16px" }} />
            )}
          </Box>

          {/* 链接列表 */}
          {isLinksExpanded && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.3,
              }}
            >
              {links.map((link, index) => (
                <Box
                  key={link.link}
                  component="a"
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    p: "6px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    color: "rgba(255, 255, 255, 0.85)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(130, 170, 255, 0.1)",
                      color: "#82aaff",
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  {/* 序号 */}
                  <Box
                    sx={{
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontWeight: 500,
                      minWidth: "14px",
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </Box>

                  {/* 标题和域名 */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.2,
                    }}
                  >
                    <Box
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.85rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {link.title}
                    </Box>
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.5)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {link.domain}
                    </Box>
                  </Box>

                  {/* 外链图标 */}
                  <LaunchIcon
                    sx={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.4)",
                      flexShrink: 0,
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Image Lightbox */}
      {!isUser && validImages && validImages.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={validImages.slice(0, 3).map((image) => ({
            src: image.original,
            alt: image.title,
          }))}
          render={{
            slide: ({ slide, rect }) => {
              const currentImage = validImages.slice(0, 3)[lightboxIndex];
              return (
                <div
                  style={{
                    position: "relative",
                    width: rect.width,
                    height: rect.height,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    crossOrigin="anonymous"
                    src={slide.src}
                    alt={slide.alt}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "90%",
                      objectFit: "contain",
                    }}
                  />
                  {currentImage?.title && (
                    <div
                      onClick={() => {
                        if (currentImage?.link) {
                          window.open(currentImage.link, "_blank");
                        }
                      }}
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        maxWidth: "80%",
                        textAlign: "center",
                        transition: "all 0.2s ease",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "underline",
                        textDecorationColor: "rgba(255, 255, 255, 0.5)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
                        e.currentTarget.style.borderColor = "rgba(130, 170, 255, 0.6)";
                        e.currentTarget.style.textDecorationColor = "rgba(130, 170, 255, 0.8)";
                        e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        e.currentTarget.style.textDecorationColor = "rgba(255, 255, 255, 0.5)";
                        e.currentTarget.style.transform = "translateX(-50%) translateY(0px)";
                      }}
                    >
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {currentImage.title}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      )}
    </Box>
  );
}

export default MessageBubble;
