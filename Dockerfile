# Start with a minimal Node.js image
FROM node:21-alpine

# Set the working directory in the container
WORKDIR .

ARG TARGET
# Copy only the necessary files (built artifacts) into the container
COPY dist/dev_${TARGET}.js /${TARGET}.js

# Expose the port on which the app is listening
EXPOSE 3000

# Command to run the application
CMD node ${TARGET}.js
