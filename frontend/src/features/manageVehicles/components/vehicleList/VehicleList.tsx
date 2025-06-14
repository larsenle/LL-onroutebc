import { RowSelectionState } from "@tanstack/table-core";
import { Box, IconButton, InputAdornment } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_Row,
  MRT_TableInstance,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import "./VehicleList.scss";
import { DeleteButton } from "../../../../common/components/buttons/DeleteButton";
import { DeleteConfirmationDialog } from "../../../../common/components/dialog/DeleteConfirmationDialog";
import { PowerUnitColumnDefinition, TrailerColumnDefinition } from "./Columns";
import { SnackBarContext } from "../../../../App";
import { ERROR_ROUTES, VEHICLES_ROUTES } from "../../../../routes/constants";
import { NoRecordsFound } from "../../../../common/components/table/NoRecordsFound";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import {
  useDeletePowerUnitsMutation,
  usePowerUnitSubTypesQuery,
} from "../../hooks/powerUnits";
import {
  useDeleteTrailersMutation,
  useTrailerSubTypesQuery,
} from "../../hooks/trailers";
import { Nullable } from "../../../../common/types/common";
import { OnRouteBCTableRowActions } from "../../../../common/components/table/OnRouteBCTableRowActions";
import {
  Vehicle,
  VehicleType,
  PowerUnit,
  Trailer,
  VEHICLE_TYPES,
} from "../../types/Vehicle";

import {
  defaultTableOptions,
  defaultTableInitialStateOptions,
  defaultTableStateOptions,
} from "../../../../common/helpers/tableHelper";
import { usePermissionMatrix } from "../../../../common/authentication/PermissionMatrix";
import { TableRowActionsOption } from "../../../../common/components/table/types/TableRowActionsOption";

/**
 * Dynamically set the column definitions based on the vehicle type.
 * @param vehicleType Type of the vehicle
 * @returns Column definition (headers/accessor keys) for vehicles for given vehicle type
 */
const getColumns = (vehicleType: VehicleType): MRT_ColumnDef<Vehicle>[] => {
  if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
    return PowerUnitColumnDefinition;
  }
  return TrailerColumnDefinition;
};

/* eslint-disable react/prop-types */
export const VehicleList = memo(
  ({
    vehicleType,
    query,
    companyId,
  }: {
    vehicleType: VehicleType;
    query: UseQueryResult<Vehicle[]>;
    companyId: number;
  }) => {
    const navigate = useNavigate();
    const {
      data: vehiclesData,
      isError: fetchVehiclesFailed,
      isFetching: isFetchingVehicles,
      isPending: vehiclesPending,
    } = query;

    const canUpdatePowerUnit = usePermissionMatrix({
      permissionMatrixKeys: {
        permissionMatrixFeatureKey: "MANAGE_VEHICLE_INVENTORY",
        permissionMatrixFunctionKey: "UPDATE_POWER_UNIT",
      },
    });

    const canUpdateTrailer = usePermissionMatrix({
      permissionMatrixKeys: {
        permissionMatrixFeatureKey: "MANAGE_VEHICLE_INVENTORY",
        permissionMatrixFunctionKey: "UPDATE_TRAILER",
      },
    });

    const canUpdateVehicle =
      vehicleType === VEHICLE_TYPES.POWER_UNIT
        ? canUpdatePowerUnit
        : canUpdateTrailer;

    const canDeletePowerUnit = usePermissionMatrix({
      permissionMatrixKeys: {
        permissionMatrixFeatureKey: "MANAGE_VEHICLE_INVENTORY",
        permissionMatrixFunctionKey: "DELETE_POWER_UNIT",
      },
    });

    const canDeleteTrailer = usePermissionMatrix({
      permissionMatrixKeys: {
        permissionMatrixFeatureKey: "MANAGE_VEHICLE_INVENTORY",
        permissionMatrixFunctionKey: "DELETE_TRAILER",
      },
    });

    const canDeleteVehicle =
      vehicleType === VEHICLE_TYPES.POWER_UNIT
        ? canDeletePowerUnit
        : canDeleteTrailer;

    const powerUnitActionOptions = [
      canUpdatePowerUnit
        ? {
            label: "Edit",
            value: "edit",
          }
        : null,
    ].filter((action) => Boolean(action)) as TableRowActionsOption[];

    const trailerActionOptions = [
      canUpdateTrailer
        ? {
            label: "Edit",
            value: "edit",
          }
        : null,
    ].filter((action) => Boolean(action)) as TableRowActionsOption[];

    const vehicleActionOptions =
      vehicleType === VEHICLE_TYPES.POWER_UNIT
        ? powerUnitActionOptions
        : trailerActionOptions;

    const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
      () => getColumns(vehicleType),
      [],
    );

    const snackBar = useContext(SnackBarContext);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const hasNoRowsSelected = Object.keys(rowSelection).length === 0;

    const shouldFetchPowerUnitSubtypesData =
      vehicleType === VEHICLE_TYPES.POWER_UNIT;

    const { data: powerUnitSubtypesData } = usePowerUnitSubTypesQuery(
      shouldFetchPowerUnitSubtypesData,
    );

    const shouldFetchTrailerSubtypesData =
      vehicleType === VEHICLE_TYPES.TRAILER;

    const { data: trailerSubtypesData } = useTrailerSubTypesQuery(
      shouldFetchTrailerSubtypesData,
    );

    const powerUnitSubTypes = useMemo(
      () => getDefaultRequiredVal([], powerUnitSubtypesData),
      [powerUnitSubtypesData],
    );

    const trailerSubTypes = useMemo(
      () => getDefaultRequiredVal([], trailerSubtypesData),
      [trailerSubtypesData],
    );

    const { mutateAsync: deletePowerUnits, isError: deletePowerUnitsFailed } =
      useDeletePowerUnitsMutation();

    const { mutateAsync: deleteTrailers, isError: deleteTrailersFailed } =
      useDeleteTrailersMutation();

    const newColumns = columns.filter(
      (item) => item.accessorKey !== `${vehicleType}TypeCode`,
    );

    const transformVehicleCode = useCallback(
      (code: string) => {
        const vehicleSubtypesForCode =
          vehicleType === VEHICLE_TYPES.POWER_UNIT
            ? powerUnitSubTypes.filter((value) => value.typeCode === code)
            : trailerSubTypes.filter((value) => value.typeCode === code);
        return getDefaultRequiredVal("", vehicleSubtypesForCode?.at(0)?.type);
      },
      [vehicleType, powerUnitSubTypes, trailerSubTypes],
    );

    const transformedVehiclesData = useMemo(() => {
      return vehiclesData?.map((vehicle) => {
        const isPowerUnit = "powerUnitTypeCode" in vehicle;
        const isTrailer = "trailerTypeCode" in vehicle;

        return {
          ...vehicle,
          vehicleSubType: isPowerUnit
            ? transformVehicleCode(vehicle.powerUnitTypeCode) // Use transformed code for PowerUnit
            : isTrailer
              ? transformVehicleCode(vehicle.trailerTypeCode) // Use transformed code for Trailer
              : undefined, // Default case if neither PowerUnit nor Trailer
        };
      });
    }, [vehiclesData, transformVehicleCode]);

    const onClickTrashIcon = useCallback(() => {
      setIsDeleteDialogOpen(() => true);
    }, []);

    const handleError = (correlationId?: string) => {
      setIsDeleteDialogOpen(() => false);
      navigate(ERROR_ROUTES.UNEXPECTED, {
        state: {
          correlationId,
        },
      });
    };

    const onConfirmDelete = async () => {
      const vehicleIds = Object.keys(rowSelection);

      try {
        const response =
          vehicleType === VEHICLE_TYPES.POWER_UNIT
            ? await deletePowerUnits({ companyId, vehicleIds })
            : await deleteTrailers({ companyId, vehicleIds });

        if (response.status === 200) {
          const responseBody = response.data;
          if (responseBody.failure.length > 0) {
            // Delete action for some vehicles failed
            handleError(response.headers["x-correlation-id"]);
          } else {
            setIsDeleteDialogOpen(() => false);
            snackBar.setSnackBar({
              message: "Vehicle Deleted",
              showSnackbar: true,
              setShowSnackbar: () => true,
              alertType: "info",
            });

            setRowSelection(() => {
              return {};
            });
            query.refetch();
          }
        } else {
          handleError(response.headers["x-correlation-id"]);
        }
      } catch {
        handleError();
      }
    };

    const onCancelDelete = useCallback(() => {
      setIsDeleteDialogOpen(() => false);
      setRowSelection(() => {
        return {};
      });
    }, []);

    const [searchFilterValue, setSearchFilterValue] = useState<string>("");

    useEffect(() => {
      if (
        fetchVehiclesFailed ||
        deletePowerUnitsFailed ||
        deleteTrailersFailed
      ) {
        handleError();
      }
    }, [
      fetchVehiclesFailed,
      deletePowerUnitsFailed,
      deleteTrailersFailed,
      handleError,
    ]);

    const table = useMaterialReactTable({
      ...defaultTableOptions,
      data: getDefaultRequiredVal([], transformedVehiclesData),
      columns: newColumns,
      initialState: {
        ...defaultTableInitialStateOptions,
        sorting: [{ id: "createdDateTime", desc: true }],
      },
      state: {
        ...defaultTableStateOptions,
        isLoading: vehiclesPending,
        showAlertBanner: fetchVehiclesFailed,
        showProgressBars: isFetchingVehicles,
        columnVisibility: { powerUnitId: false, trailerId: false },
        rowSelection,
        globalFilter: searchFilterValue,
      },
      getRowId: (originalRow) => {
        if (vehicleType === VEHICLE_TYPES.TRAILER) {
          return (originalRow as Trailer).trailerId as string;
        }
        return (originalRow as PowerUnit).powerUnitId as string;
      },
      displayColumnDefOptions: {
        "mrt-row-select": {
          size: 32,
        },
        "mrt-row-actions": {
          header: "",
          muiTableBodyCellProps: {
            className: "vehicles-list__row-actions",
          },
        },
      },
      layoutMode: "grid",
      onRowSelectionChange: setRowSelection,
      enableMultiSort: true,
      enablePagination: true,
      enableBottomToolbar: true,
      renderEmptyRowsFallback: () => <NoRecordsFound />,
      renderRowActions: useCallback(
        ({ row }: { row: MRT_Row<Vehicle> }) =>
          canUpdateVehicle ? (
            <OnRouteBCTableRowActions
              onSelectOption={() => {
                if (!canUpdateVehicle) return;

                if (vehicleType === VEHICLE_TYPES.POWER_UNIT) {
                  navigate(
                    `${VEHICLES_ROUTES.POWER_UNIT_DETAILS}/${row.getValue(
                      "powerUnitId",
                    )}`,
                  );
                } else if (vehicleType === VEHICLE_TYPES.TRAILER) {
                  navigate(
                    `${VEHICLES_ROUTES.TRAILER_DETAILS}/${row.getValue(
                      "trailerId",
                    )}`,
                  );
                }
              }}
              options={vehicleActionOptions}
              disabled={!canUpdateVehicle}
            />
          ) : null,
        [canUpdateVehicle, vehicleActionOptions, vehicleType],
      ),
      filterFns: {
        defaultSearchFilter: (row, columnId, filterValue) => {
          return (
            (columnId === "plate" &&
              row.getValue<string>(columnId).includes(filterValue)) ||
            (columnId === "vin" &&
              row.getValue<string>(columnId).includes(filterValue)) ||
            (columnId === "unitNumber" &&
              row.getValue<Nullable<string>>(columnId)?.includes(filterValue))
          );
        },
      },
      globalFilterFn: "defaultSearchFilter",
      onGlobalFilterChange: setSearchFilterValue,
      // Include search filter and delete button in top toolbar
      renderTopToolbar: useCallback(
        ({ table }: { table: MRT_TableInstance<Vehicle> }) => (
          <Box className="vehicles-list__top-toolbar">
            <div className="vehicles-list__search">
              <MRT_GlobalFilterTextField
                table={table}
                className="search-input"
                InputProps={{
                  className: "search-input__input-container",
                  startAdornment: (
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="search-icon"
                    />
                  ),
                  endAdornment:
                    searchFilterValue !== "" ? (
                      <InputAdornment position="end">
                        <IconButton
                          className="search-input__clear-button"
                          onClick={() => table.setGlobalFilter("")}
                        >
                          <FontAwesomeIcon
                            icon={faCircleXmark}
                            className="clear-icon"
                          />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                }}
                inputProps={{
                  className: "search-input__input-textfield",
                }}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
              />
            </div>

            {canDeleteVehicle && (
              <DeleteButton
                onClick={onClickTrashIcon}
                disabled={hasNoRowsSelected}
              />
            )}
          </Box>
        ),
        [canDeleteVehicle, hasNoRowsSelected, searchFilterValue],
      ),
    });

    return (
      <div className="vehicles-list table-container">
        <MaterialReactTable table={table} />
        <DeleteConfirmationDialog
          onDelete={onConfirmDelete}
          showDialog={isDeleteDialogOpen}
          onCancel={onCancelDelete}
          itemToDelete="item"
        />
      </div>
    );
  },
);

VehicleList.displayName = "VehicleList";
