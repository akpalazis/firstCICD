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
          sh 'docker build -t my_node:latest .'
          sh 'docker run -d -p 3000:3000 my_node:latest'
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
    stage('Docker Stop v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'docker stop my-node:latest'
          sh 'docker rm my-node:latest'
          sh 'docker rmi my-node:latest'
        }
      }
    }
  }
}
