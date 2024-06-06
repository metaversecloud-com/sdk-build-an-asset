FROM --platform=linux/arm64 node:20.10-alpine3.19
WORKDIR /app
ARG REF
ARG COMMIT_HASH
COPY . ./
EXPOSE 3000
CMD ["npm", "start"]
