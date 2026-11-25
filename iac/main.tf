terraform {
  required_providers {
    libvirt = {
      source  = "dmacvicar/libvirt"
      version = "0.8.3"
    }
  }
}

provider "libvirt" {
  uri = "qemu:///system"
}

locals {
  vms = [
    {
      name     = "VM1 - Aplicação web"
      hostname = "vm1-aplicacao-web"
      slug     = "vm1-aplicacao-web"
    },
    {
      name     = "VM2 - API-e-banco"
      hostname = "vm2-api-e-banco"
      slug     = "vm2-api-e-banco"
    }
  ]
}

resource "libvirt_volume" "ubuntu_base" {
  name   = "ubuntu-24.04-base.qcow2"
  pool   = "default"
  source = "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  format = "qcow2"
}

resource "libvirt_volume" "vm_disk" {
  count          = length(local.vms)
  name           = "${local.vms[count.index].slug}.qcow2"
  pool           = "default"
  base_volume_id = libvirt_volume.ubuntu_base.id
  format         = "qcow2"
  size           = 10 * 1024 * 1024 * 1024
}

resource "libvirt_cloudinit_disk" "init" {
  count = length(local.vms)
  name  = "${local.vms[count.index].slug}-cloudinit.iso"
  pool  = "default"
  user_data = templatefile("${path.module}/cloud_init.yaml", {
    hostname = local.vms[count.index].hostname
    ssh_key  = trimspace(file(pathexpand("~/.ssh/devops_lab.pub")))
  })
}

resource "libvirt_domain" "vm" {
  count  = length(local.vms)
  name   = local.vms[count.index].name
  memory = 2048
  vcpu   = 2
  cpu {
    mode = "host-passthrough"
  }
  cloudinit = libvirt_cloudinit_disk.init[count.index].id

  network_interface {
    network_name   = "default"
    wait_for_lease = true
  }

  disk {
    volume_id = libvirt_volume.vm_disk[count.index].id
  }

  console {
    type        = "pty"
    target_type = "serial"
    target_port = "0"
  }
}

output "ips" {
  value = {
    for vm in libvirt_domain.vm :
    vm.name => vm.network_interface[0].addresses[0]
  }
}