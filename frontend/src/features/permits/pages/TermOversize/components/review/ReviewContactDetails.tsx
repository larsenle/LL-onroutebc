import { Box, Typography } from "@mui/material";

import "./ReviewContactDetails.scss";
import { ContactDetails } from "../../../../types/application";
import {
  areValuesDifferent,
  getDefaultRequiredVal,
} from "../../../../../../common/helpers/util";
import { DiffChip } from "./DiffChip";

const nameDisplay = (firstName?: string, lastName?: string) => {
  if (!firstName) return getDefaultRequiredVal("", lastName);
  if (!lastName) return getDefaultRequiredVal("", firstName);
  return `${firstName} ${lastName}`;
};

const phoneDisplay = (phone?: string, ext?: string) => {
  if (!phone) return "";
  const firstPart = `${phone}`;
  const secondPart =
    getDefaultRequiredVal("", ext).trim() !== "" ? `Ext: ${ext}` : "";
  return `${firstPart} ${secondPart}`;
};

export const ReviewContactDetails = ({
  contactDetails,
  showChangedFields = false,
  oldFields = undefined,
}: {
  contactDetails?: ContactDetails;
  showChangedFields?: boolean;
  oldFields?: ContactDetails;
}) => {
  const changedFields = showChangedFields
    ? {
        name:
          nameDisplay(contactDetails?.firstName, contactDetails?.lastName) !==
          nameDisplay(oldFields?.firstName, oldFields?.lastName),
        phone1:
          phoneDisplay(
            contactDetails?.phone1,
            contactDetails?.phone1Extension,
          ) !== phoneDisplay(oldFields?.phone1, oldFields?.phone1Extension),
        phone2:
          phoneDisplay(
            contactDetails?.phone2,
            contactDetails?.phone2Extension,
          ) !== phoneDisplay(oldFields?.phone2, oldFields?.phone2Extension),
        email: areValuesDifferent(contactDetails?.email, oldFields?.email),
        fax: areValuesDifferent(contactDetails?.fax, oldFields?.fax),
      }
    : {
        name: false,
        phone1: false,
        phone2: false,
        email: false,
        fax: false,
      };

  return (
    <Box className="review-contact-details">
      <Box className="review-contact-details__header">
        <Typography
          variant={"h3"}
          className="review-contact-details__title"
          data-testid="review-contact-details-title"
        >
          Contact Information
        </Typography>
      </Box>
      <Box className="review-contact-details__body">
        <Box className="contact-details">
          <Typography className="contact-details__detail">
            <span
              className="contact-details__data"
              data-testid="review-contact-details-name"
            >
              {nameDisplay(contactDetails?.firstName, contactDetails?.lastName)}
            </span>
            {changedFields.name ? <DiffChip /> : null}
          </Typography>
          <Typography className="contact-details__detail">
            <span className="contact-details__label">Primary Phone:</span>
            <span
              className="contact-details__data"
              data-testid="review-contact-details-phone1"
            >
              {phoneDisplay(
                contactDetails?.phone1,
                contactDetails?.phone1Extension,
              )}
            </span>
            {changedFields.phone1 ? <DiffChip /> : null}
          </Typography>
          {contactDetails?.phone2 ? (
            <Typography className="contact-details__detail">
              <span className="contact-details__label">Alternate Phone:</span>
              <span
                className="contact-details__data"
                data-testid="review-contact-details-phone2"
              >
                {phoneDisplay(
                  contactDetails?.phone2,
                  contactDetails?.phone2Extension,
                )}
              </span>
              {changedFields.phone2 ? <DiffChip /> : null}
            </Typography>
          ) : null}
          <Typography className="contact-details__detail">
            <span className="contact-details__label">Email:</span>
            <span
              className="contact-details__data"
              data-testid="review-contact-details-email"
            >
              {contactDetails?.email}
            </span>
            {changedFields.email ? <DiffChip /> : null}
          </Typography>
          {contactDetails?.fax ? (
            <Typography className="contact-details__detail">
              <span className="contact-details__label">Fax:</span>
              <span
                className="contact-details__data"
                data-testid="review-contact-details-fax"
              >
                {phoneDisplay(contactDetails?.fax)}
              </span>
              {changedFields.fax ? <DiffChip /> : null}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};