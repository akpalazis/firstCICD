pipeline {
  agent any

  stages {

    // Stage for test on the developer branch
    stage('Developer Test') {
      when {
        expression { env.BRANCH_NAME == 'origin/developer' } // Only run this stage for the developer branch
      }
      steps {
        script {
          sh 'npm run test'
        }
      }
    }

    // Stage for Build to development environment
    stage('Developer Build') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'npm run build-dev'
        }
      }
    }

    stage('Simple Test') {
      steps {
        // Add your deployment steps for the developer branch here
        script {
          echo env.BRANCH_NAME
        }
      }
    }

  }
}
