import {
  Box,
  type BoxProps,
  Button,
  ClickAwayListener,
  Grow,
  List,
  Paper,
  Popper,
  type PopperProps,
  listItemIconClasses,
} from "@mui/material";
import {
  bindPopper,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import React, { type ReactNode, isValidElement } from "react";

export default function PopperMenuButton({
  PopperProps,
  menus,
  ...props
}: { PopperProps: Omit<PopperProps, "open">; menus?: ReactNode } & BoxProps<
  typeof Button
>) {
  const state = usePopupState({ variant: "popper" });

  return (
    <>
      <Box component={Button} {...bindTrigger(state)} {...props} />

      <Popper transition {...PopperProps} {...bindPopper(state)}>
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={state.close as any}>
            <Grow {...TransitionProps}>
              <Paper>
                <List
                  dense
                  sx={{
                    [`.${listItemIconClasses.root}`]: {
                      minWidth: 24,
                    },
                  }}
                >
                  {React.Children.map(menus, (menu) =>
                    !isValidElement(menu)
                      ? menu
                      : React.cloneElement(menu, {
                          onClick: async (...args: any[]) => {
                            await (menu.props as any).onClick?.(...args);
                            state.close();
                          },
                        } as any),
                  )}
                </List>
              </Paper>
            </Grow>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
