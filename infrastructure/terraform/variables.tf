variable "aws_region" {
  description = "AWS region where KubeStack infrastructure will be deployed"
  type        = string
  default     = "ap-south-1"
}

variable "admin_cidr" {
  description = "Public IP address allowed to access SSH and Kubernetes API"
  type        = string
}

variable "ec2_ami_id" {
  description = "AMI ID for the KubeStack EC2 instance"
  type        = string
}

variable "ec2_instance_type" {
  description = "EC2 instance type for KubeStack"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Existing AWS EC2 key pair name"
  type        = string
}