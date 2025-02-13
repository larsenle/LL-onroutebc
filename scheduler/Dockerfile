#  Build container
FROM node:20.15.1-alpine AS builder

# Set the working directory to /app inside the container
WORKDIR /app

# Copy app files
COPY . ./

# Create and Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm

# Install packages, build and keep only prod packages
RUN npm ci
RUN npm run build
RUN npm prune --production



# Deployment container
FROM node:20.15.1-alpine
RUN npm cache clean --force

# Create and Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm

# Set the working directory to /app inside the deployment container
WORKDIR /app

# Set node to production
ENV NODE_ENV ${NODE_ENV}

# Set environment variables
ENV DB_TYPE ${DB_TYPE}
ENV SCHEDULER_API_LOG_LEVEL ${SCHEDULER_API_LOG_LEVEL}
ENV SCHEDULER_API_TYPEORM_LOG_LEVEL ${SCHEDULER_API_TYPEORM_LOG_LEVEL}
ENV SCHEDULER_API_MAX_QUERY_EXECUTION_TIME_MS ${SCHEDULER_API_MAX_QUERY_EXECUTION_TIME_MS}
ENV SCHEDULER_API_MSSQL_MAX_CONNECTION ${SCHEDULER_API_MSSQL_MAX_CONNECTION}
ENV MSSQL_HOST ${MSSQL_HOST}
ENV MSSQL_PORT ${MSSQL_PORT}
ENV MSSQL_DB ${MSSQL_DB}
ENV MSSQL_SA_USER ${MSSQL_SA_USER}
ENV MSSQL_SA_PASSWORD ${MSSQL_SA_PASSWORD}
ENV MSSQL_ENCRYPT ${MSSQL_ENCRYPT}
ENV KEYCLOAK_ISSUER_URL ${KEYCLOAK_ISSUER_URL}
ENV KEYCLOAK_AUDIENCE ${KEYCLOAK_AUDIENCE}
ENV KEYCLOAK_IGNORE_EXP ${KEYCLOAK_IGNORE_EXP}
ENV OCIO_S3_ACCESSKEYID ${OCIO_S3_ACCESSKEYID}
ENV OCIO_S3_BUCKET ${OCIO_S3_BUCKET}
ENV OCIO_S3_PRESIGNED_URL_EXPIRY ${OCIO_S3_PRESIGNED_URL_EXPIRY}
ENV OCIO_S3_ENDPOINT ${OCIO_S3_ENDPOINT}
ENV OCIO_S3_KEY ${OCIO_S3_KEY}
ENV OCIO_S3_SECRETACCESSKEY ${OCIO_S3_SECRETACCESSKEY}
ENV TPS_POLL_LIMIT ${TPS_POLL_LIMIT}
ENV TPS_PENDING_POLLING_INTERVAL ${TPS_PENDING_POLLING_INTERVAL}
ENV TPS_ERROR_POLLING_INTERVAL ${TPS_ERROR_POLLING_INTERVAL}
ENV TPS_MONITORING_POLLING_INTERVAL ${TPS_MONITORING_POLLING_INTERVAL}
ENV CFS_PRIVATE_KEY ${CFS_PRIVATE_KEY}
ENV CFS_PRIVATE_KEY_PASSPHRASE ${CFS_PRIVATE_KEY_PASSPHRASE}
ENV CFS_SFTP_USERNAME ${CFS_SFTP_USERNAME}
ENV CFS_SFTP_HOST ${CFS_SFTP_HOST}
ENV CFS_SFTP_PORT ${CFS_SFTP_PORT}
ENV CFS_REMOTE_PATH ${CFS_REMOTE_PATH}
ENV ORBC_SERVICE_ACCOUNT_CLIENT_ID ${ORBC_SERVICE_ACCOUNT_CLIENT_ID}
ENV ORBC_SERVICE_ACCOUNT_CLIENT_SECRET ${ORBC_SERVICE_ACCOUNT_CLIENT_SECRET}
ENV ORBC_SERVICE_ACCOUNT_TOKEN_URL ${ORBC_SERVICE_ACCOUNT_TOKEN_URL}
ENV ACCESS_API_URL ${ACCESS_API_URL}
ENV ISSUE_PERMIT_LIMIT ${ISSUE_PERMIT_LIMIT}
ENV DOC_GEN_LIMIT ${DOC_GEN_LIMIT}
ENV PERMIT_SCHEDULE_POLLING_INTERVAL ${PERMIT_SCHEDULE_POLLING_INTERVAL}

# Copy production files from build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN apk add --no-cache curl

# Expose Port
EXPOSE 5050

# Non-root user
USER node

# Start the app
CMD ["npm", "run", "start:prod"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:5050/
