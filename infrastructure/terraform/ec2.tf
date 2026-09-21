resource "aws_instance" "kubestack" {
  ami                         = var.ec2_ami_id
  instance_type               = var.ec2_instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.kubestack.id]
  associate_public_ip_address = true
  key_name                    = var.ec2_key_name

  iam_instance_profile = aws_iam_instance_profile.kubestack_ec2.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name        = "kubestack-ec2"
    Project     = "KubeStack"
    Environment = "development"
  }
}