pipeline {
  agent any
  tools {
    nodejs "npm"
    docker "docker"
  }
  stages {

    // Stage for test on the developer branch
    stage('Developer Test v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        script {
          sh 'npm install'
          sh 'npm run test'
        }
      }
    }

    // Stage for Build to development environment
    stage('Developer Build v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'npm run build-dev'
          sh 'docker build -t my-node-app:latest .'
        }
      }
    }
    stage('Developer Run v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'docker run -p 3000:3000 my-node-app:latest'
        }
      }
    }
  }
}
