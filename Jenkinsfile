pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm test' // Add your tests here
      }
    }
    stage('Run') {
      steps {
        sh 'npm start'
      }
    }
  }
}
