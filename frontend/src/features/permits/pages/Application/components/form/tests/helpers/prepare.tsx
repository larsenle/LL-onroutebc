import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import userEvent from "@testing-library/user-event";
import { Options } from "@testing-library/user-event/dist/types/options";

import { DEFAULT_PERMIT_TYPE, isQuarterlyPermit } from "../../../../../../types/PermitType";
import { getDefaultConditions, getMandatoryConditions } from "../../../../../../helpers/conditions";
import { PermitDetails } from "../../PermitDetails";
import { getExpiryDate } from "../../../../../../helpers/permitState";
import { PermitCondition } from "../../../../../../types/PermitCondition";
import { ORBC_FORM_FEATURES } from "../../../../../../../../common/types/common";
import { MAX_ALLOWED_FUTURE_DAYS_CV } from "../../../../../../constants/constants";
import {
  PAST_START_DATE_STATUSES,
} from "../../../../../../../../common/components/form/subFormComponents/CustomDatePicker";

import {
  getStartOfDate,
  now,
} from "../../../../../../../../common/helpers/formatDate";

import {
  durationOptionsForPermitType,
  getMaxAllowedPermitFutureStartDate,
  getMinAllowedPermitPastStartDate,
  minDurationForPermitType,
} from "../../../../../../helpers/dateSelection";

const feature = ORBC_FORM_FEATURES.TEST_FEATURE;
export const currentDt = getStartOfDate(now());
export const tomorrow = dayjs(currentDt).add(1, "day");
export const day = currentDt.date();
export const thisMonth = currentDt.month();
export const thisYear = currentDt.year();
export const daysInCurrMonth = currentDt.daysInMonth();
export const tomorrowDay = tomorrow.date();
export const maxFutureDate = dayjs(currentDt).add(14, "day");
export const maxFutureMonth = maxFutureDate.month();
export const maxFutureYear = maxFutureDate.year();
export const maxFutureDay = maxFutureDate.date();
export const daysInFutureMonth = maxFutureDate.daysInMonth();

const permitType = DEFAULT_PERMIT_TYPE;
export const conditions = getDefaultConditions(permitType);
export const defaultDuration = minDurationForPermitType(permitType);
export const emptyConditions: PermitCondition[] = [];
export const allDurations = durationOptionsForPermitType(permitType, false).map(
  (durationOption) => ({
    text: durationOption.label,
    days: durationOption.value,
  }),
);

const mandatoryConditions = getMandatoryConditions(permitType).map(
  (condition) => condition.condition,
);
export const requiredConditionIndices = conditions
  .map((condition, i) =>
    mandatoryConditions.includes(condition.condition) ? i : -1,
  )
  .filter((i) => i >= 0);

const TestFormWrapper = (props: React.PropsWithChildren) => {
  const formMethods = useForm({
    defaultValues: {
      permitData: {
        startDate: currentDt,
        permitDuration: defaultDuration,
        expiryDate: getExpiryDate(
          currentDt,
          isQuarterlyPermit(permitType),
          defaultDuration,
        ),
        commodities: [],
        loas: [],
      },
    },
    reValidateMode: "onBlur",
  });

  return <FormProvider {...formMethods}>{props.children}</FormProvider>;
};

export const renderTestComponent = (
  startDate: Dayjs,
  duration: number,
  conditions: PermitCondition[],
  userEventOptions?: Options,
) => {
  const user = userEvent.setup(userEventOptions);
  let selectedConditions = [...conditions];
  const expiryDate = getExpiryDate(
    startDate,
    isQuarterlyPermit(permitType),
    duration,
  );

  const allConditions = getDefaultConditions(permitType, false)
    .map(condition => {
      const existingCondition = selectedConditions
        .find(c => c.condition === condition.condition);

      return {
        ...condition,
        checked: existingCondition
          ? existingCondition.checked
          : condition.checked,
      };
    },
  );

  const minAllowedPastStartDate = getMinAllowedPermitPastStartDate(
    permitType,
    currentDt,
    currentDt,
    false,
    false,
  );

  const maxAllowedFutureStartDate = getMaxAllowedPermitFutureStartDate(
    currentDt,
    false,
  );

  const renderedComponent = render(
    <TestFormWrapper>
      <PermitDetails
        feature={feature}
        permitType={permitType}
        startDate={startDate}
        minAllowedPastStartDate={minAllowedPastStartDate}
        maxAllowedFutureStartDate={maxAllowedFutureStartDate}
        maxNumDaysAllowedInFuture={MAX_ALLOWED_FUTURE_DAYS_CV}
        expiryDate={expiryDate}
        allConditions={allConditions}
        durationOptions={allDurations.map((duration) => ({
          label: duration.text,
          value: duration.days,
        }))}
        pastStartDateStatus={PAST_START_DATE_STATUSES.FAIL}
        onSetConditions={(updatedConditions) => {
          selectedConditions = [...updatedConditions];
        }}
      />
    </TestFormWrapper>,
  );

  return { user, renderedComponent };
};

export const renderDefaultTestComponent = (userEventOptions?: Options) => {
  return renderTestComponent(
    currentDt,
    defaultDuration,
    emptyConditions,
    userEventOptions,
  );
};
