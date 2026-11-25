# Cadastro de Produtos

Aplicação web para cadastrar e consultar produtos. A página é publicada na
VM1; a API REST em Node.js e o banco MySQL são implantados em containers Docker
na VM2.

## Requisitos

- OpenTofu instalado e configurado para usar o provider libvirt.
- Ansible instalado na máquina de controle.
- Libvirt/KVM disponível, com a rede `default` configurada.
- Chave SSH privada `~/.ssh/devops_lab` e chave pública `~/.ssh/devops_lab.pub`.

## Provisionar as máquinas

Na raiz do projeto, inicialize o OpenTofu e crie as VMs:

```sh
cd iac
tofu init
tofu apply
```

As VMs usam o modo de CPU `host-passthrough` para expor ao MySQL as instruções
de CPU necessárias. Se as VMs já existiam, reaplique `tofu apply` após essa
configuração e reinicie a VM2 antes de executar o playbook.

Confirme os endereços retornados por `tofu apply`. O arquivo
`ansible/inventory.ini` contém os endereços atuais:

- VM1 (aplicação web): `192.168.122.22`
- VM2 (API e MySQL): `192.168.122.12`

Se os endereços provisionados forem diferentes, atualize `ansible_host` para
cada VM no inventário antes de executar o Ansible.

## Implantar os serviços

Volte à raiz do projeto e execute:

```sh
cd ..
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

O playbook instala e inicia Nginx na VM1. Na VM2, instala Docker e Docker
Compose, gera as senhas da aplicação e inicia a API e o MySQL. Os dados do
MySQL ficam persistidos em um volume Docker na VM2.

## Acessar a aplicação

Com os endereços atuais do inventário, abra no navegador:

**http://192.168.122.22**

Use **Cadastrar produto** para enviar produtos à API. O link **Listar todos os
produtos** consulta os registros armazenados no MySQL da VM2. Se os IPs forem
diferentes, acesse o endereço da VM1 retornado pelo OpenTofu.

## Autoria

Gabriel da Silva Freitas RA: 24001078