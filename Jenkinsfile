pipeline {
  agent any

  triggers {
    // Trigger build on push to developer branch
    githubPush(branchFilter: 'developer')
  }

  stages {
    // Build stage for main branch
    stage('Main Build') {
      when {
        expression { branch == 'main' } // Only run this stage for main branch
      }
      steps {
        // Add your build steps for the main branch here, such as:
        script {
          sh 'npm install' // Install dependencies
          sh 'npm test' // Run unit tests
          sh 'npm run build-prod' // Build for production (assuming you have a build script)
        }
      }
    }

    // Build stage for developer branch
    stage('Developer Build') {
      when {
        expression { branch == 'developer' } // Only run this stage for developer branch
      }
      steps {
        // Add your build steps for the developer branch here, such as:
        script {
          sh 'npm install' // Install dependencies
          sh 'npm test' // Run unit tests
          sh 'npm run build-dev' // Build for development (assuming you have a build script)
        }
      }
    }

    // Run stage (optional)
    stage('Developer Run') {
      when{
        expression {branch == 'developer'}
      }
      steps {
        // Add your steps to run the API, such as:
        script {
          sh 'npm run start-dev' // Start the API
        }
      }
    }
    stage('Production Run'){
      when{
        expression {branch == 'main'}
      }
      steps{
        script{
          sh 'npm run start-prod'
        }
      }
    }
  }
}
