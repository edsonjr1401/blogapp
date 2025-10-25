const { DataTypes } = require('sequelize');
const db = require('../config/bd');
const Categorias = require('./Categorias'); // Presume que este é o modelo 'Categorias'

const Postagem = db.define('Postagem', {
    // 1. Otimização: Strings mais curtas para varchar, TEXT para longos.
    titulo: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    slug: {
        // 2. Indexação para consultas rápidas e unicidade (boas práticas para slugs)
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
    },
    descricao: {
        // 3. TEXT é adequado, mas STRING(255) pode ser suficiente para descrição curta.
        // Mantendo TEXT pela robustez, se for o caso.
        type: DataTypes.TEXT,
        allowNull: false
    },
    conteudo: {
        type: DataTypes.TEXT('long'), // Opção para conteúdo muito longo
        allowNull: false
    },
    // 4. Remoção de 'data': Sequelize adiciona createdAt/updatedAt automaticamente.
    // Se a coluna 'data' for necessária para a data de publicação, manter.
    // Se 'data' for a data de criação, use timestamps: true (padrão) e remova esta coluna.
    data_publicacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Sugestão: Preencher automaticamente na criação
    },

    // A Chave Estrangeira será criada automaticamente pelo Sequelize se o relacionamento for definido
    // corretamente, mas mantemos a definição explícita para clareza e controle:
    categoriaId: { 
        type: DataTypes.INTEGER,
        allowNull: false, // Uma postagem deve ter uma categoria
        // Referência explícita (pode ser omitida, mas é bom para clareza)
        references: {
            model: Categorias, // 5. Referenciar o objeto Model, não a string 'Categorias'
            key: 'id'
        }
    }
}, {
    // 6. Configurações adicionais
    tableName: 'postagens', // Boa prática: definir o nome exato da tabela
    timestamps: true,       // Padrão: Adiciona createdAt e updatedAt
    // Se você não quer createdAt/updatedAt, use: timestamps: false
});

// 7. Definição do Relacionamento (One-to-Many: Postagem pertence a Categoria)
Postagem.belongsTo(Categorias, { 
    // Mantenha 'categoriaId' como foreignKey, mas use um alias no singular
    foreignKey: 'categoriaId', 
    as: 'categoria', // 8. Boa prática: usar 'as' no singular para belongsTo (Postagem pertence a UMA categoria)
    onDelete: 'CASCADE' // 9. Se a categoria for deletada, a postagem também deve ser
});

// 10. Definição inversa (para consultas de Categoria para Postagens)
Categorias.hasMany(Postagem, { 
    foreignKey: 'categoriaId', 
    as: 'postagens' 
});


module.exports = Postagem;