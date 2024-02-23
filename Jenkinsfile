pipeline {
  agent any


  stages {
    // Build stage for developer branch
    stage('Developer Build') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for developer branch
      }
      steps {
        // Add your build steps for the developer branch here, such as:
        script {
          sh 'npm install' // Install dependencies
          sh 'npm test' // Run unit tests
          sh 'npm run build:development' // Build for development (assuming you have a build script)
        }
      }
    }

    // Run stage (optional)
    stage('Run') {
      steps {
        // Add your steps to run the API, such as:
        script {
          sh 'npm start' // Start the API
        }
      }
    }
  }
}
