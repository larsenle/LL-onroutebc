import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

import "./TabLayout.scss";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ComponentProps {
  label: string;
  component: JSX.Element;
}

interface TabLayoutProps {
  bannerText: string;
  bannerButton?: JSX.Element;
  componentList: ComponentProps[];
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="tabpanel-container"
      role="tabpanel"
      hidden={value !== index}
      id={`layout-tabpanel-${index}`}
      aria-labelledby={`layout-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

const TabProps = (index: number) => {
  return {
    id: `layout-tab-${index}`,
    "aria-controls": `layout-tabpanel-${index}`,
  };
};

const DisplayTabs = ({
  value,
  handleChange,
  componentList,
}: {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  componentList: ComponentProps[];
}) => (
  <Tabs
    value={value}
    onChange={handleChange}
    variant="scrollable"
    scrollButtons="auto"
    aria-label="scrollable profile tabs"
  >
    {componentList.map(({ label }, index) => {
      return (
        <Tab
          key={label}
          label={label}
          {...TabProps(index)}
          //sx={{ px: 0, marginRight: "40px", fontWeight: 700 }}
        />
      );
    })}
  </Tabs>
);

const DisplayTabPanels = ({
  value,
  componentList,
}: {
  value: number;
  componentList: ComponentProps[];
}) => (
  <>
    {componentList.map(({ label, component }, index) => {
      return (
        <TabPanel key={label} value={value} index={index}>
          {component}
        </TabPanel>
      );
    })}
  </>
);

const DisplayBanner = ({
  bannerText,
  bannerButton,
}: {
  bannerText: string;
  bannerButton?: JSX.Element;
}) => (
  <div className="layout-banner">
    <h2>{bannerText}</h2>
    {bannerButton ? bannerButton : null}
  </div>
);

/**
 * The TabLayout component is a common component that includes a Banner, Tabs, and TabPanels.
 *
 * Code for the Tabs is based on the example from MUI Tabs
 * See the 'basic tabs' typescript example here:
 * https://mui.com/material-ui/react-tabs/#basic-tabs
 *
 * @param bannerText - string to display on the banner. (Example: "Profile")
 * @param bannerButton - string to display on the banner. (Example: "Profile")
 * @param componentList - Array of ComponentProps that contain labels (string) and components (JSX.Element)
 * @returns React component containing a layout for a Banner, Tabs, and TabPanels.
 */
export const TabLayout = React.memo(
  ({ bannerText, bannerButton, componentList }: TabLayoutProps) => {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
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
          <DisplayBanner bannerText={bannerText} bannerButton={bannerButton} />
          <DisplayTabs
            value={value}
            handleChange={handleChange}
            componentList={componentList}
          />
        </Box>
        <DisplayTabPanels value={value} componentList={componentList} />
      </>
    );
  }
);

TabLayout.displayName = "TabLayout";