# API de Produtos (Node.js + Express + MySQL)

## Executar com Docker Compose
Na pasta `api`, copie `.env.example` para `.env`, substitua os valores de senha
e inicie os serviços:

```sh
cp .env.example .env
docker compose up -d --build
```

A API ficará disponível na porta `3000`. Os dados do MySQL são persistidos no
volume Docker `mysql_data`; a porta `3306` não é publicada no host.

Para encerrar os serviços sem apagar os dados:

```sh
docker compose down
```

Para apagar também o banco persistido, use `docker compose down --volumes`.

## Implantar nas VMs
O playbook em `ansible/playbook.yml` instala Docker e Docker Compose na VM2 e
implanta esta stack. A VM1 publica a página web; a VM2 disponibiliza a API na
porta `3000`. Confirme que os endereços do `ansible/inventory.ini` correspondem
às VMs criadas pelo OpenTofu antes de executar o playbook a partir da raiz:

```sh
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

Se a implantação nativa anterior já tiver sido executada, o playbook para os
serviços nativos da API e do MySQL para liberar as portas. Os dados existentes
no MySQL nativo não são migrados automaticamente para o volume Docker.

## Rotas
### POST /produto
```
curl -X POST http://localhost:3000/produto \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teclado","categoria":"Periféricos","preco":149.90,"quantidade":25}'
```
Resposta `201` com o produto criado. Dados inválidos retornam `400`.

### GET /produtos
```
curl http://localhost:3000/produtos
```
Retorna um array JSON com todos os produtos.
