output "vpc_id" {
  description = "KubeStack VPC ID"
  value       = aws_vpc.kubestack.id
}

output "public_subnet_id" {
  description = "KubeStack public subnet ID"
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "KubeStack private subnet ID"
  value       = aws_subnet.private.id
}

output "instance_id" {
  description = "KubeStack EC2 instance ID"
  value       = aws_instance.kubestack.id
}

output "instance_public_ip" {
  description = "KubeStack EC2 public IP"
  value       = aws_instance.kubestack.public_ip
}

output "instance_private_ip" {
  description = "KubeStack EC2 private IP"
  value       = aws_instance.kubestack.private_ip
}

output "backend_ecr_repository_url" {
  description = "KubeStack backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repository_url" {
  description = "KubeStack frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}