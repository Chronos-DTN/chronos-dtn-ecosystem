namespace ChronosDtnNetApi.Models;

// Por que: Representa a conta monetária de uma corporação ou mineradora espacial hospedada em um nó físico.
public class Account
{
    // Por que: Código numérico único identificador da conta bancária.
    public long Id { get; set; }

    // Por que: ID do nó onde esta conta é liquidada localmente (ex: 1 para Terra, 2 para Lua).
    public long NodeId { get; set; }

    // Por que: Instância do nó hospedeiro da conta para controle estrutural do banco.
    public Node? Node { get; set; }

    // Por que: Nome da empresa ou entidade titular da conta (ex: SpaceX Account).
    public string Holder { get; set; } = string.Empty;

    // Por que: Saldo financeiro com precisão adequada para operações de débito/crédito.
    public decimal Balance { get; set; }

    // Por que: Abreviação monetária da conta (ex: USD para dólar, LUN para moedas lunares).
    public string Currency { get; set; } = string.Empty;
}
