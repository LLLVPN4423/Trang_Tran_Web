using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreOrderRepository(FirestoreDb db) : IOrderRepository
{
    private CollectionReference Collection => db.Collection("orders");

    public async Task<Order?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFromDocument(doc.ConvertTo<OrderDocument>()) : null;
    }

    public async Task<Order?> GetByPaymentCodeAsync(string paymentCode, CancellationToken cancellationToken = default)
    {
        var query = Collection.WhereEqualTo("PaymentCode", paymentCode).Limit(1);
        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        var doc = snapshot.Documents.FirstOrDefault();
        return doc is null ? null : MapFromDocument(doc.ConvertTo<OrderDocument>());
    }

    public async Task<IReadOnlyList<Order>> GetAllAsync(
        OrderStatus? status = null,
        string? phone = null,
        string? customerId = null,
        CancellationToken cancellationToken = default)
    {
        Query query = Collection;

        if (status is not null)
            query = query.WhereEqualTo("Status", status.ToString());

        if (!string.IsNullOrWhiteSpace(customerId))
            query = query.WhereEqualTo("CustomerId", customerId);

        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        var orders = snapshot.Documents
            .Select(d => MapFromDocument(d.ConvertTo<OrderDocument>()))
            .AsEnumerable();

        if (!string.IsNullOrWhiteSpace(phone))
            orders = orders.Where(o => o.CustomerPhone.Contains(phone, StringComparison.OrdinalIgnoreCase));

        return orders.OrderByDescending(o => o.CreatedAt).ToList();
    }

    public async Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(order.Id))
            order.Id = Guid.NewGuid().ToString();

        order.CreatedAt = DateTime.UtcNow;
        await Collection.Document(order.Id).SetAsync(MapToDocument(order), cancellationToken: cancellationToken);
        return order;
    }

    public async Task<Order> UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        order.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(order.Id).SetAsync(MapToDocument(order), cancellationToken: cancellationToken);
        return order;
    }

    private static Order MapFromDocument(OrderDocument doc) =>
        new()
        {
            Id = doc.Id,
            CustomerId = doc.CustomerId,
            CustomerName = doc.CustomerName,
            CustomerPhone = doc.CustomerPhone,
            CustomerEmail = doc.CustomerEmail,
            Notes = doc.Notes,
            Items = doc.Items.Select(i => new OrderItem
            {
                ItemId = i.ItemId,
                ItemType = Enum.Parse<OrderItemType>(i.ItemType),
                Name = i.Name,
                Quantity = i.Quantity,
                UnitPrice = (decimal)i.UnitPrice,
                HairSize = i.HairSize is null ? null : Enum.Parse<HairSize>(i.HairSize),
            }).ToList(),
            SubtotalAmount = (decimal)(doc.SubtotalAmount != 0 ? doc.SubtotalAmount : doc.TotalAmount),
            DiscountAmount = (decimal)doc.DiscountAmount,
            PromotionCode = doc.PromotionCode,
            PointsRedeemed = doc.PointsRedeemed,
            PointsEarned = doc.PointsEarned,
            TotalAmount = (decimal)doc.TotalAmount,
            Status = Enum.Parse<OrderStatus>(doc.Status),
            PaymentCode = doc.PaymentCode,
            SePayTransactionId = doc.SePayTransactionId,
            PaidAt = doc.PaidAt is null ? null : FirestoreMapper.FromTimestamp(doc.PaidAt),
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt),
        };

    private static OrderDocument MapToDocument(Order order) =>
        new()
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerEmail = order.CustomerEmail,
            Notes = order.Notes,
            Items = order.Items.Select(i => new OrderItemDocument
            {
                ItemId = i.ItemId,
                ItemType = i.ItemType.ToString(),
                Name = i.Name,
                Quantity = i.Quantity,
                UnitPrice = (double)i.UnitPrice,
                HairSize = i.HairSize?.ToString(),
            }).ToList(),
            SubtotalAmount = (double)order.SubtotalAmount,
            DiscountAmount = (double)order.DiscountAmount,
            PromotionCode = order.PromotionCode,
            PointsRedeemed = order.PointsRedeemed,
            PointsEarned = order.PointsEarned,
            TotalAmount = (double)order.TotalAmount,
            Status = order.Status.ToString(),
            PaymentCode = order.PaymentCode,
            SePayTransactionId = order.SePayTransactionId,
            PaidAt = order.PaidAt is null ? null : FirestoreMapper.ToTimestamp(order.PaidAt.Value),
            CreatedAt = FirestoreMapper.ToTimestamp(order.CreatedAt),
            UpdatedAt = order.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(order.UpdatedAt.Value),
        };
}

[FirestoreData]
internal sealed class OrderDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? CustomerId { get; set; }

    [FirestoreProperty]
    public string CustomerName { get; set; } = string.Empty;

    [FirestoreProperty]
    public string CustomerPhone { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? CustomerEmail { get; set; }

    [FirestoreProperty]
    public string? Notes { get; set; }

    [FirestoreProperty]
    public List<OrderItemDocument> Items { get; set; } = [];

    [FirestoreProperty]
    public double SubtotalAmount { get; set; }

    [FirestoreProperty]
    public double DiscountAmount { get; set; }

    [FirestoreProperty]
    public string? PromotionCode { get; set; }

    [FirestoreProperty]
    public int PointsRedeemed { get; set; }

    [FirestoreProperty]
    public int PointsEarned { get; set; }

    [FirestoreProperty]
    public double TotalAmount { get; set; }

    [FirestoreProperty]
    public string Status { get; set; } = OrderStatus.Pending.ToString();

    [FirestoreProperty]
    public string PaymentCode { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? SePayTransactionId { get; set; }

    [FirestoreProperty]
    public Timestamp? PaidAt { get; set; }

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}

[FirestoreData]
internal sealed class OrderItemDocument
{
    [FirestoreProperty]
    public string ItemId { get; set; } = string.Empty;

    [FirestoreProperty]
    public string ItemType { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty]
    public int Quantity { get; set; }

    [FirestoreProperty]
    public double UnitPrice { get; set; }

    [FirestoreProperty]
    public string? HairSize { get; set; }
}
