FROM node:22-alpine
WORKDIR /app
ARG REF
ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG BUILD_TIME
ENV BUILD_TIME=$BUILD_TIME
COPY . ./
RUN echo "export REF=$REF" > commit_info.txt && echo "export COMMIT_HASH=$COMMIT_HASH" >> commit_info.txt
EXPOSE 3000
CMD ["npm", "start"]
