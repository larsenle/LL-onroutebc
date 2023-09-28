import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/table-core";
import MaterialReactTable, {
  MRT_Row,
  MRT_TableInstance,
} from "material-react-table";
import { useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { SnackBarContext } from "../../../App";
import { NoRecordsFound } from "../../../common/components/table/NoRecordsFound";
import { FIVE_MINUTES } from "../../../common/constants/constants";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import DeleteConfirmationDialog from "../../manageVehicles/components/list/ConfirmationDialog";
import { Trash } from "../../manageVehicles/components/options/Trash";
import { getCompanyUsers } from "../apiManager/manageProfileAPI";
import { UserManagementTableRowActions } from "../components/user-management/UserManagementRowOptions";
import { UserManagementColumnsDefinition } from "../types/UserManagementColumns";
import { BCeIDUserStatus, ReadCompanyUser } from "../types/userManagement.d";

/**
 * User Management Component for CV Client.
 */
export const UserManagement = () => {
  const query = useQuery({
    queryKey: ["companyUsers"],
    queryFn: getCompanyUsers,
    staleTime: FIVE_MINUTES,
  });
  const { data, isError, isInitialLoading } = query;
  const snackBar = useContext(SnackBarContext);
  const { user: userFromToken } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  /**
   * Callback function for clicking on the Trash icon above the Table.
   */
  const onClickTrashIcon = useCallback(() => {
    setIsDeleteDialogOpen(() => true);
  }, []);

  /**
   * Function that deletes one or more users.
   */
  const onConfirmDelete = async () => {
    // Uncomment this line -const userNames: string[] = Object.keys(rowSelection);
    // For implementation.
    setIsDeleteDialogOpen(() => false);
  };

  /**
   * Function that clears the delete related states when the user clicks on cancel.
   */
  const onCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(() => false);
    setRowSelection(() => {
      return {};
    });
  }, []);

  useEffect(() => {
    if (isError) {
      snackBar.setSnackBar({
        message: "An unexpected error occurred.",
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: "error",
      });
    }
  }, [isError]);

  return (
    <>
      <MaterialReactTable
        columns={UserManagementColumnsDefinition}
        data={data ?? []}
        state={{
          showAlertBanner: isError,
          showProgressBars: isInitialLoading,
          columnVisibility: { applicationId: true },
          isLoading: isInitialLoading,
          rowSelection: rowSelection,
        }}
        renderEmptyRowsFallback={() => <NoRecordsFound />}
        selectAllMode="page"
        // Enable checkboxes for row selection
        enableRowSelection={(row: MRT_Row<ReadCompanyUser>): boolean => {
          if (row?.original?.userGUID === userFromToken?.profile?.bceid_user_guid) {
            return false;
          }
          return true;
        }}
        onRowSelectionChange={setRowSelection}
        enableStickyHeader
        enablePagination={false}
        positionActionsColumn="last"
        // Disable the default column actions so that we can use our custom actions
        enableColumnActions={false}
        enableRowActions={true}
        getRowId={(originalRow: ReadCompanyUser) => originalRow.userName}
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "",
          },
        }}
        renderRowActions={useCallback(
          ({
            row,
          }: {
            table: MRT_TableInstance<ReadCompanyUser>;
            row: MRT_Row<ReadCompanyUser>;
          }) => {
            if (row.original.statusCode === BCeIDUserStatus.ACTIVE) {
              return (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <UserManagementTableRowActions
                    userGUID={row.original.userGUID}
                  />
                </Box>
              );
            } else {
              return <></>;
            }
          },
          []
        )}
        renderToolbarInternalActions={useCallback(
          () => (
            <Box
              sx={{
                display: "flex",
                backgroundColor: "white",
              }}
            >
              <Trash onClickTrash={onClickTrashIcon} />
            </Box>
          ),
          []
        )}
        /*
         *
         * STYLES
         *
         */
        // Main table container
        muiTablePaperProps={{
          sx: {
            border: "none",
            boxShadow: "none",
          },
        }}
        // Column widths
        defaultColumn={{
          size: 50,
          maxSize: 200,
          minSize: 25,
        }}
        // Cell/Body container
        muiTableContainerProps={{
          sx: {
            height: "calc(100vh - 475px)",
            outline: "1px solid #DBDCDC",
          },
        }}
        // Pagination
        muiBottomToolbarProps={{
          sx: {
            backgroundColor: BC_COLOURS.bc_background_light_grey,
            zIndex: 0,
          },
        }}
        // Alert banner
        muiToolbarAlertBannerProps={
          isError
            ? {
                color: "error",
                children: "Error loading data",
              }
            : undefined
        }
        // Top toolbar
        muiTopToolbarProps={{ sx: { zIndex: 0 } }}
        // Row Header
        muiTableHeadRowProps={{
          sx: {
            backgroundColor: BC_COLOURS.bc_background_light_grey,
          },
        }}
      />
      <DeleteConfirmationDialog
        onClickDelete={onConfirmDelete}
        isOpen={isDeleteDialogOpen}
        onClickCancel={onCancelDelete}
        caption="user"
      />
    </>
  );
};