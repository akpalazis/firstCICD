pipeline {
  agent any
  tools {
    nodejs "npm"
    dockerTool "docker"
  }
  stages {


    // Stage for Build to development environment
    stage('Developer Build v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'npm install'
          sh 'npm run build-dev'
          sh 'docker build -t my-node-app:latest .'
        }
      }
    }
    // Stage for test on the developer branch
    stage('Developer Test v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        script {
          sh 'npm run test'
        }
      }
    }
    stage('Stop Docker Container') {
            steps {
                script {
                    sh 'docker stop my-node-app:latest'
                    sh 'docker rm my-node-app:latest'
                }
            }
        }
  }
}
