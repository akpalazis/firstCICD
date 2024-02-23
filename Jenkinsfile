pipeline {
  agent any

  stages {
    // Stage for building on the developer branch
    stage('Developer Build') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your build steps for the developer branch here, such as compiling, testing, etc.
        script {
          echo 'Building on the developer branch'
        }
      }
    }

    // Stage for deploying to development environment
    stage('Developer Deploy') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          echo 'Deploying to the development environment'
        }
      }
    }
  }
}
