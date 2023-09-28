import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Banner } from "../../../common/components/dashboard/Banner";
import "../../../common/components/dashboard/Dashboard.scss";
import { DATE_FORMATS, toLocal } from "../../../common/helpers/formatDate";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../common/helpers/util";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import {
  getCompanyUserByUserGUID
} from "../apiManager/manageProfileAPI";
import { EditUserForm } from "../components/forms/userManagement/EditUser";
import { BCEID_PROFILE_TABS } from "../types/manageProfile.d";

/**
 * The edit user page for the BCeID org admin
 */
export const EditUserDashboard = React.memo(() => {
  const navigate = useNavigate();
  const { userGUID } = useParams();

  const { data: userInfo, isLoading } = useQuery(
    ["userByuserGUID", userGUID],
    () => getCompanyUserByUserGUID(userGUID as string),
    { retry: false, enabled: true, staleTime: Infinity }
  );

  const onClickBreadcrumb = () => {
    navigate("../", {
      state: {
        selectedTab: BCEID_PROFILE_TABS.USER_MANAGEMENT_ORGADMIN,
      },
    });
  };

  return (
    <>
      <Box
        className="layout-box"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Banner
          bannerText={`Edit User: ${userInfo?.firstName} ${" "} ${
            userInfo?.lastName
          }`}
          bannerSubtext={
            <div>
              <strong>Date Created:</strong>
              &nbsp;
              {applyWhenNotNullable(
                (dateTimeStr: string) =>
                  toLocal(dateTimeStr, DATE_FORMATS.SHORT),
                userInfo?.createdDateTime,
                ""
              )}
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              <strong>Last Updated:</strong>&nbsp;{" "}
              {getDefaultRequiredVal(
                "",
                applyWhenNotNullable(
                  (dateTimeStr: string) =>
                    toLocal(dateTimeStr, DATE_FORMATS.SHORT),
                  userInfo?.updatedDateTime
                ),
                applyWhenNotNullable(
                  (dateTimeStr: string) =>
                    toLocal(dateTimeStr, DATE_FORMATS.SHORT),
                  userInfo?.createdDateTime,
                  ""
                )
              )}
            </div>
          }
          extendHeight={true}
        />
      </Box>
      <Box
        className="layout-box"
        sx={{
          display: "flex",
          height: "60px",
          alignItems: "center",
          backgroundColor: BC_COLOURS.white,
        }}
      >
        <Typography
          onClick={onClickBreadcrumb}
          sx={{
            color: BC_COLOURS.bc_text_links_blue,
            cursor: "pointer",
            marginRight: "8px",
            textDecoration: "underline",
          }}
        >
          Profile
        </Typography>
        <FontAwesomeIcon
          icon={faChevronRight}
          style={{ marginLeft: "8px", marginRight: "8px" }}
        />
        <Typography
          onClick={onClickBreadcrumb}
          style={{
            color: BC_COLOURS.bc_text_links_blue,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          User Management
        </Typography>
        <FontAwesomeIcon
          icon={faChevronRight}
          style={{ marginLeft: "8px", marginRight: "8px" }}
        />
        <Typography>Edit User</Typography>
      </Box>

      {!isLoading && <EditUserForm userInfo={userInfo} />}
    </>
  );
});

EditUserDashboard.displayName = "EditUserDashboard";